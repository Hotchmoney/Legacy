# Legacy

_Legacy_ is a roguelike in development for the Amazon Alexa platform. Players play as a family trying to recover a precious heirloom lost in a cave system. These caves are inhabited by several different groups of creatures, each with their own goals and desires---and one of them has what was lost. The player must explore the caves, interact with these groups, and retrieve their artifact.

Should their character die, the player takes control of a new character from the family's next generation. But in the meantime, the people of the caves have changed, too.

## Technologies

_Legacy_ is written in Node and makes extensive use of the [Alexa SDK](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs). [Graphlib](https://github.com/dagrejs/graphlib) is used to represent the cave maps as graphs. The Node project is located in the lambda/custom/ directory.

## Roadmap

The MVP has no procedural generation of cultures and maps; those will be developed for the full game.

### MVP

* [x] Exploring
  * Describe current room
  * Describe exits from current room
  * Move between rooms
* [] Culture design
* [] NPC interaction
* [] Generational changes
* [] Introduction and ending

### Final

* [] Culture generation
* [] Map generation
