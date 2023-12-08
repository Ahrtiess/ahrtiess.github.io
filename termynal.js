/**
 * termynal.js
 * A lightweight, modern and extensible animated terminal window, using
 * async/await.
 *
 * @author Ines Montani <ines@ines.io>
 * @version 0.0.1
 * @license MIT
 */

'use strict';

class Termynal {
    /**
     * 
     * @param {(string|Node)=} container 
     * @param {Object=} options 
     * @param {string} options.prefix 
     * @param {number} options.startDelay 
     * @param {number} options.typeDelay 
     * @param {number} options.lineDelay 
     * @param {number} options.progressLength 
     * @param {string} options.progressChar 
	 * @param {number} options.progressPercent 
     * @param {string} options.cursor 
     * @param {Object[]} lineData 
     * @param {boolean} options.noInit 
     */
    constructor(container = '#termynal', options = {}) {
        this.container = (typeof container === 'string') ? document.querySelector(container) : container;
        this.pfx = `data-${options.prefix || 'ty'}`;
        this.startDelay = options.startDelay
            || parseFloat(this.container.getAttribute(`${this.pfx}-startDelay`)) || 600;
        this.typeDelay = options.typeDelay
            || parseFloat(this.container.getAttribute(`${this.pfx}-typeDelay`)) || 90;
        this.lineDelay = options.lineDelay
            || parseFloat(this.container.getAttribute(`${this.pfx}-lineDelay`)) || 1500;
        this.progressLength = options.progressLength
            || parseFloat(this.container.getAttribute(`${this.pfx}-progressLength`)) || 40;
        this.progressChar = options.progressChar
            || this.container.getAttribute(`${this.pfx}-progressChar`) || '█';
		this.progressPercent = options.progressPercent
            || parseFloat(this.container.getAttribute(`${this.pfx}-progressPercent`)) || 100;
        this.cursor = options.cursor
            || this.container.getAttribute(`${this.pfx}-cursor`) || '▋';
        this.lineData = this.lineDataToElements(options.lineData || []);
        if (!options.noInit) this.init()
    }

   
    init() {
        this.lines = [...this.container.querySelectorAll(`[${this.pfx}]`)].concat(this.lineData);

        const containerStyle = getComputedStyle(this.container);
        this.container.style.width = containerStyle.width !== '0px' ? 
            containerStyle.width : undefined;
        this.container.style.minHeight = containerStyle.height !== '0px' ? 
            containerStyle.height : undefined;

        this.container.setAttribute('data-termynal', '');
        this.container.innerHTML = '';
        this.start();
    }

async start() {
  await this._wait(this.startDelay);

  for (let line of this.lines) {
      await this.type(line);
      await this._wait(this.lineDelay);
      line.removeAttribute(`${this.pfx}-cursor`);
  }
}

    /**
  
     * @param {Node} line - The line element to render.
     */
    async type(line) {
        const chars = [...line.textContent];
        const delay = line.getAttribute(`${this.pfx}-typeDelay`) || this.typeDelay;
        line.textContent = '';
        this.container.appendChild(line);

        for (let char of chars) {
            await this._wait(delay);
            line.textContent += char;
        }
    }

    /**
     * Animate a progress bar.
     * @param {Node} line - The line element to render.
     */
    async progress(line) {
        const progressLength = line.getAttribute(`${this.pfx}-progressLength`)
            || this.progressLength;
        const progressChar = line.getAttribute(`${this.pfx}-progressChar`)
            || this.progressChar;
        const chars = progressChar.repeat(progressLength);
		const progressPercent = line.getAttribute(`${this.pfx}-progressPercent`)
			|| this.progressPercent;
        line.textContent = '';
        this.container.appendChild(line);

        for (let i = 1; i < chars.length + 1; i++) {
            await this._wait(this.typeDelay);
            const percent = Math.round(i / chars.length * 100);
            line.textContent = `${chars.slice(0, i)} ${percent}%`;
			if (percent>progressPercent) {
				break;
			}
        }
    }

    /**
     * Helper function for animation delays, called with `await`.
     * @param {number} time - Timeout, in ms.
     */
    _wait(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    /**
     * Converts line data objects into line elements.
     * 
     * @param {Object[]} lineData - Dynamically loaded lines.
     * @param {Object} line - Line data object.
     * @returns {Element[]} - Array of line elements.
     */
    lineDataToElements(lineData) {
        return lineData.map(line => {
            let div = document.createElement('div');
            div.innerHTML = `<span ${this._attributes(line)}>${line.value || ''}</span>`;

            return div.firstElementChild;
        });
    }

    /**
     * Helper function for generating attributes string.
     * 
     * @param {Object} line - Line data object.
     * @returns {string} - String of attributes.
     */
    _attributes(line) {
        let attrs = '';
        for (let prop in line) {
            attrs += this.pfx;

            if (prop === 'type') {
                attrs += `="${line[prop]}" `
            } else if (prop !== 'value') {
                attrs += `-${prop}="${line[prop]}" `
            }
        }

        return attrs;
    }
}


if (document.currentScript.hasAttribute('data-termynal-container')) {
    const containers = document.currentScript.getAttribute('data-termynal-container');
    containers.split('|')
        .forEach(container => new Termynal(container))
}