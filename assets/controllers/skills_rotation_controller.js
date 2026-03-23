import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
    static values = {
        interval: { type: Number, default: 3000 },
        count: { type: Number, default: 2 }
    }

    connect() {
        this.skills = this.element.querySelectorAll('.skill-tag--featured');
        this.currentIndices = [];

        if (this.skills.length > 0) {
            this.initializeActive();
            this.startRotation();
        }
    }

    disconnect() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }

    initializeActive() {
        // Pick random initial skills
        const indices = this.getRandomIndices(this.countValue);
        indices.forEach(i => {
            this.skills[i].classList.add('active');
            this.currentIndices.push(i);
        });
    }

    startRotation() {
        this.timer = setInterval(() => {
            this.rotate();
        }, this.intervalValue);
    }

    rotate() {
        // Remove one random active skill
        const removeIndex = Math.floor(Math.random() * this.currentIndices.length);
        const oldSkillIndex = this.currentIndices[removeIndex];
        this.skills[oldSkillIndex].classList.remove('active');
        this.currentIndices.splice(removeIndex, 1);

        // Add a new random skill (not already active)
        const availableIndices = [];
        for (let i = 0; i < this.skills.length; i++) {
            if (!this.currentIndices.includes(i)) {
                availableIndices.push(i);
            }
        }

        const newSkillIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        this.skills[newSkillIndex].classList.add('active');
        this.currentIndices.push(newSkillIndex);
    }

    getRandomIndices(count) {
        const indices = [];
        const available = Array.from({ length: this.skills.length }, (_, i) => i);

        for (let i = 0; i < Math.min(count, this.skills.length); i++) {
            const randomIndex = Math.floor(Math.random() * available.length);
            indices.push(available[randomIndex]);
            available.splice(randomIndex, 1);
        }

        return indices;
    }
}
