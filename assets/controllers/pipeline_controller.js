import { Controller } from '@hotwired/stimulus';

/*
 * Fait avancer un seul « run » le long du pipeline : l'étape courante s'allume,
 * les précédentes restent validées. Le run s'arrête quand tout est validé,
 * pour laisser la page lisible (et ne pas animer indéfiniment).
 */
export default class extends Controller {
    static targets = ['stage', 'done'];
    static values = {
        interval: { type: Number, default: 1100 },
        // Laisse les étapes finir leur apparition (animation « rise » en cascade, ~0,8 s) avant le run.
        delay: { type: Number, default: 800 },
    };

    connect() {
        this.current = -1;
        this.startTimeout = setTimeout(() => {
            this.timer = setInterval(() => this.advance(), this.intervalValue);
            this.advance();
        }, this.delayValue);
    }

    disconnect() {
        clearTimeout(this.startTimeout);
        clearInterval(this.timer);
    }

    advance() {
        this.current++;

        this.stageTargets.forEach((stage, i) => {
            stage.classList.toggle('is-done', i < this.current);
            stage.classList.toggle('is-active', i === this.current);
        });

        // Un tour de plus que le nombre d'étapes : pipeline entièrement validé, le check passe au vert.
        if (this.current === this.stageTargets.length) {
            clearInterval(this.timer);
            this.doneTarget.classList.add('is-done');
        }
    }
}
