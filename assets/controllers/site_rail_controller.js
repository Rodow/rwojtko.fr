import { Controller } from '@hotwired/stimulus';

const RADIUS = 16;
const UNDERLINE_GAP = 10;
const TITLE_MARGIN = 24;

/*
 * Trace le trait qui relie les rails de la page (pipeline → expériences → formation).
 * Pour chaque segment : part du nœud `from`, contourne le titre par la droite si besoin,
 * le souligne en revenant vers la gauche, puis descend se raccrocher au rail de `to`.
 * Les positions sont mesurées dans la page : le tracé suit la mise en page à toutes les tailles.
 */
export default class extends Controller {
    static values = { segments: Array };

    connect() {
        this.draw = this.draw.bind(this);
        this.observer = new ResizeObserver(this.draw);
        this.observer.observe(document.body);
        document.fonts.ready.then(this.draw);
    }

    disconnect() {
        this.observer.disconnect();
    }

    draw() {
        const svg = this.element;
        // Remis à zéro avant de mesurer, sinon l'ancienne taille gonflerait la hauteur de la page.
        svg.setAttribute('width', 0);
        svg.setAttribute('height', 0);

        const paths = this.segmentsValue.map((segment) => this.segmentPath(segment));

        svg.setAttribute('width', document.documentElement.scrollWidth);
        svg.setAttribute('height', document.documentElement.scrollHeight);
        svg.replaceChildren(...paths);
    }

    segmentPath({ from, title, to }) {
        const fromElement = document.querySelector(from);
        const toElement = document.querySelector(to);
        const titleBox = pageRect(document.querySelector(title));

        const start = { x: railX(fromElement), y: nodeY(fromElement) };
        const end = { x: railX(toElement), y: nodeY(toElement) };
        const underlineY = titleBox.bottom + UNDERLINE_GAP;
        // Le soulignement se parcourt de droite à gauche : il faut arriver à droite du titre.
        const rightX = Math.max(start.x, titleBox.right + TITLE_MARGIN);

        const points = [start];
        if (rightX > start.x) {
            // Contourne le titre par la droite, sous le bloc de départ pour ne pas le traverser.
            const detourY = (pageRect(fromElement).bottom + titleBox.top) / 2;
            points.push({ x: start.x, y: detourY }, { x: rightX, y: detourY });
        }
        points.push({ x: rightX, y: underlineY }, { x: end.x, y: underlineY }, end);

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', roundedPath(points, RADIUS));
        return path;
    }
}

// Position dans la page, d'après la mise en page (offset*) et non l'affichage (getBoundingClientRect) :
// les transformations, comme l'animation d'apparition des étapes, ne doivent pas décaler le tracé.
function pageRect(element) {
    let top = 0;
    let left = 0;
    for (let current = element; current; current = current.offsetParent) {
        top += current.offsetTop;
        left += current.offsetLeft;
    }
    return { top, left, bottom: top + element.offsetHeight, right: left + element.offsetWidth };
}

// Axe du rail, dessiné par le ::before de l'étape.
function railX(element) {
    const rail = getComputedStyle(element, '::before');
    return pageRect(element).left + parseFloat(rail.left) + parseFloat(rail.width) / 2;
}

// Centre vertical du nœud, dessiné par le ::after de l'étape.
function nodeY(element) {
    const node = getComputedStyle(element, '::after');
    // Nœuds en border-box : la hauteur inclut déjà la bordure.
    return pageRect(element).top + parseFloat(node.top) + parseFloat(node.marginTop) + parseFloat(node.height) / 2;
}

// Polyligne aux angles arrondis.
function roundedPath(points, radius) {
    let d = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length - 1; i++) {
        const [previous, corner, next] = [points[i - 1], points[i], points[i + 1]];
        const r = Math.min(radius, distance(previous, corner) / 2, distance(corner, next) / 2);
        const entry = towards(corner, previous, r);
        const exit = towards(corner, next, r);
        d += ` L ${entry.x} ${entry.y} Q ${corner.x} ${corner.y} ${exit.x} ${exit.y}`;
    }

    const last = points[points.length - 1];
    return `${d} L ${last.x} ${last.y}`;
}

function distance(a, b) {
    return Math.hypot(b.x - a.x, b.y - a.y);
}

function towards(from, to, length) {
    const total = distance(from, to);
    if (total === 0) {
        return from;
    }
    return {
        x: from.x + ((to.x - from.x) * length) / total,
        y: from.y + ((to.y - from.y) * length) / total,
    };
}
