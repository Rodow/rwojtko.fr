import { Controller } from '@hotwired/stimulus';

/*
 * Fait avancer un « run » le long du pipeline : l'étape courante s'allume,
 * les précédentes restent validées, puis on repart du début.
 */
export default class extends Controller {
    static targets = ['stage'];
    static values = {
        interval: { type: Number, default: 1100 },
    };

    connect() {
        this.current = -1;
        this.timer = setInterval(() => this.advance(), this.intervalValue);
        this.advance();
    }

    disconnect() {
        clearInterval(this.timer);
    }

    advance() {
        // Un tour de plus que le nombre d'étapes : pipeline entièrement validé, puis remise à zéro.
        this.current = (this.current + 1) % (this.stageTargets.length + 1);

        this.stageTargets.forEach((stage, i) => {
            stage.classList.toggle('is-done', i < this.current);
            stage.classList.toggle('is-active', i === this.current);
        });
    }
}
