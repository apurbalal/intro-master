const DEFAULT_SPACING = 10;
const DEFAULT_CHARACTER_SIZE = 100;
const MODAL_MAX_WIDTH = 240;
const MODAL_MIN_HEIGHT = 200;

class Vector2D {
  x;
  y;

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  
  distance(v) {
    return Math.sqrt((v.x - this.x) ** 2 + (v.y - this.y) ** 2);
  }
}

class Character {
  #container;
  #character;
  #textData = { text: 'Hello world' };
  #position = new Vector2D(DEFAULT_SPACING, DEFAULT_SPACING);

  constructor() {
    this.#textData = {
      text: 'Should I tell you how to use this website?',
      style: {},
    };
    this.#initialDOMSetup();
  }

  #initialDOMSetup() {
    // Initialize and add containers
    this.#character = this.#createCharacter({ state: "idle" });
    this.#container = this.#createCharacterContainer({ position: this.#position });
    this.#container.appendChild(this.#character);
    document.body.appendChild(this.#container);
    this.#displayModal({ characterPos: this.#position, textData: this.#textData });
  }

  #gotoNextNode() {
    /*
      If there is no next node, tutorial is over destroy self
    */
    const node = document.querySelector('[data-tutorial="tutorial"]');
    if (!node) {
      this.#destroySelf();
      return;
    } else {
      const description = node?.getAttribute('data-tutorial-description');
      node.removeAttribute('data-tutorial');

      if (node) {
        const { x, y, bottom, right } = node.getBoundingClientRect();
        const currentPost = this.#position;

        const timeMillis = this.#calculateTime(
          currentPost,
          new Vector2D(x, y),
        );

        const newPosition = this.#getCharacterPosition({
          characterPosition: currentPost,
          nodeRect: { x, y, bottom, right },
        });

        let scale = 1;
        // To invert the character if it is moving left
        if (x < currentPost.x) {
          scale = -1;
        } else {
          scale = 1;
        }

        this.#updateCharacterAnim({
          scale,
          state: "run",
        });

        this.#moveCharacterToPosition({
          position: newPosition,
          timeMillis,
        });

        console.log(newPosition);

        // Display modal after the character has reached the node
        setTimeout(() => {
          if (description) {
            this.#textData = {
              text: description,
            }
            this.#position = newPosition;
            this.#displayModal({
              characterPos: newPosition,
              textData: {
                text: description,
              }
            });
            this.#updateCharacterAnim({
              scale,
              state: "idle",
            });
          }
        }, timeMillis);
      }
    }
  }

  #getCharacterPosition({ characterPosition, nodeRect }) {
    const [horizontal, vertical] = this.#placement(new Vector2D(nodeRect.x, nodeRect.y), nodeRect.right , DEFAULT_CHARACTER_SIZE);

    let newPosition;
    // Set the position of the character
    if (horizontal === "left") {
      newPosition = new Vector2D(nodeRect.x, characterPosition.y);
    } else {
      newPosition = new Vector2D(nodeRect.right - DEFAULT_CHARACTER_SIZE, characterPosition.y);
    }

    if (vertical === "top") {
      newPosition = new Vector2D(newPosition.x, nodeRect.y - DEFAULT_CHARACTER_SIZE);
    } else {
      newPosition = new Vector2D(newPosition.x, nodeRect.bottom + 0);
    }

    return newPosition;
  }

  #updateCharacterAnim({ scale, state }) {
    this.#character.src = `https://raw.githubusercontent.com/apurbalal/intro-master/main/src/gif/${state}.gif`;
    this.#character.style.transform = `scaleX(${scale})`;
  }

  #moveCharacterToPosition({ position, timeMillis }) {
    this.#container.style.transition = `all ${timeMillis}ms linear`;
    this.#container.style.left = position.x + 'px';
    this.#container.style.top = position.y + 'px';
  }

  #displayModal({
    characterPos,
    textData,
  }) {
    if (this.#textData) {
      const modal = this.#createModal({ textData });
      const [horizontal, vertical] = this.#placement(characterPos, MODAL_MAX_WIDTH, MODAL_MIN_HEIGHT);

      if (horizontal === "left") {
        modal.style.left = characterPos.x + DEFAULT_SPACING + "px";
      } else {
        modal.style.right = window.innerWidth - characterPos.x - DEFAULT_CHARACTER_SIZE + "px";
      }

      if (vertical === "top") {
        modal.style.bottom = window.innerHeight - characterPos.y + "px";
      } else {
        modal.style.top = characterPos.y + DEFAULT_CHARACTER_SIZE + DEFAULT_SPACING + "px";
      }

      document.body.appendChild(modal);
    }
  }

  #calculateTime(start, end) {
    const distance = start.distance(end);
    return distance;
  }

  #createCharacterContainer({ position }) {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.width = '100px';
    container.style.height = '100px';
    container.style.transition = 'all 0.5s linear';
    container.style.zIndex = '999';
    container.style.top = position.y + 'px';
    container.style.left = position.x + 'px';
    return container;
  }

  #createCharacter({ state }) {
    const character = document.createElement('img');
    character.src = `./gif/${state}.gif`;
    character.style.width = '100%';
    character.style.height = '100%';
    character.style.transform = 'scaleX(1)';
    return character;
  }

  #createModal({ textData }) {
    const modal = document.createElement('div');
    modal.style.position = 'absolute';
    modal.style.backgroundColor = 'white';
    modal.style.color = 'black';
    modal.style.padding = '8px 12px';
    modal.style.borderRadius = '4px';
    modal.style.zIndex = '1000';
    modal.style.maxWidth = MODAL_MAX_WIDTH + 'px';
    modal.style.boxShadow = '0 0 10px 0 black';

    const text = document.createElement('p');
    text.textContent = textData.text;
    text.style.position = 'relative';
    text.style.zIndex = '1000';
    text.style.wordWrap = 'break-word';
    modal.appendChild(text);

    const button = this.#createModalButton(modal);
    modal.appendChild(button);

    return modal;
  }

  #createModalButton(modal) {
    const container = document.createElement('div');
    const positiveButton = document.createElement('button');
    positiveButton.textContent = 'Next';
    positiveButton.style.backgroundColor = 'blue';
    positiveButton.style.color = 'white';
    positiveButton.style.border = 'none';
    positiveButton.style.padding = '8px 12px';
    positiveButton.style.borderRadius = '4px';
    positiveButton.style.marginRight = '8px';
    positiveButton.style.cursor = 'pointer';
    positiveButton.onclick = () => {
      modal.remove();
      this.#gotoNextNode();
    }

    const negativeButton = document.createElement('button');
    negativeButton.textContent = 'Close';
    negativeButton.style.backgroundColor = 'red';
    negativeButton.style.color = 'white';
    negativeButton.style.border = 'none';
    negativeButton.style.padding = '8px 12px';
    negativeButton.style.borderRadius = '4px';
    negativeButton.style.cursor = 'pointer';
    negativeButton.onclick = () => {
      modal.remove();
    };

    container.appendChild(positiveButton);
    container.appendChild(negativeButton);

    return container;
  }

  #placement(position, horizontalCutOff, verticalCutOff) {
    // check if position is near the edge of the screen
    // if it is, place modal on the opposite side
    const placement = ["left", "bottom"];
    if (position.x < window.innerWidth - horizontalCutOff) {
      placement[0] = "left";
    } else {
      placement[0] = "right";
    }

    if (position.y < window.innerHeight - verticalCutOff) {
      placement[1] = "bottom";
    } else {
      placement[1] = "top";
    }
    return placement;
  }

  #destroySelf() {
    this.#container.remove();
  }
}

const character = new Character();
