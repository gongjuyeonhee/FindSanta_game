import { Bodies, Body, Collision, Engine, Events, Render, Runner, World } from "matter-js";
import { ONUMENTS_BASE } from "./onuments";

let ONUMENTS = ONUMENTS_BASE;

document.body.style.backgroundColor = '#e2f9c2';

const engine =  Engine.create();
const render = Render.create({
    engine,
    element: document.body,
    options: {
        wireframes: false,
        background: "#FDF7E4",
        width: 620,
        height: 850,
    }
});

const world = engine.world;

const leftWall = Bodies.rectangle(15, 395, 30, 790, {
    isStatic: true,
    render: { fillStyle: "#527853"}
});

const rightWall = Bodies.rectangle(605, 395, 30, 790, {
    isStatic: true,
    render: { fillStyle: "#527853"}
});

const ground = Bodies.rectangle(310, 820, 620, 60, {
    isStatic: true,
    render: { fillStyle: "#527853"}
});

const topLine = Bodies.rectangle(310, 150, 620, 2, {
    name: "topLine",
    isStatic: true,
    isSensor: true,
    render: { fillStyle: "#BF3131"}
})

World.add(world, [leftWall, rightWall, ground, topLine]);

Render.run(render);
Runner.run(engine);

let currentBody = null;
let currentOnument = null;
let disableAction = false;
let interval = null;
let num_santa = 0;
let isGameClear = false; // 게임 클리어 상태를 나타내는 변수

function addOnument() {

    const index = Math.floor(Math.random() * 5);
    const onument = ONUMENTS_BASE[index];

    const body = Bodies.circle(300, 50, onument.radius, {
        index: index,
        isSleeping: true,
        render: {
            sprite: { texture: `${onument.name}.png`}
        },
        restitution: 0.2,
    });

    // 초기화를 여기서 확인
    console.log("Adding onument. Current index:", index, "Current onument:", onument);


    currentBody = body;
    currentOnument = onument;

    World.add(world, body);

    if (isGameClear) {
        return; // 게임이 클리어되었을 때 추가적인 조작을 막음
    }
}

window.onkeydown = (event) => {
    if (disableAction) {
        return;
    }

    switch (event.code) {
        case "KeyA":
            if( interval)
                return;

            interval = setInterval(() => {
                if (currentBody.position.x > 60) {
                    Body.setPosition(currentBody, {
                        x: currentBody.position.x - 1,
                        y: currentBody.position.y,
                    });
                }
            }, 1);
            break;

        case "KeyD":
            if (interval)
                return;

            interval = setInterval(() => {
                if (currentBody.position.x < 560) {
                    Body.setPosition(currentBody, {
                        x: currentBody.position.x + 1,
                        y: currentBody.position.y,
                    });
                }
            }, 1);
            break;

        case "KeyS":
            currentBody.isSleeping = false;
            disableAction = true;

            setTimeout(() => {
                addOnument();
                disableAction = false;
            }, 1000);
            break;
    }
}

window.onkeyup = (event) => {
    switch (event.code) {
      case "KeyA":
      case "KeyD":
        clearInterval(interval);
        interval = null;
    }
}

function resetGame() {
    World.clear(world, false);

    disableAction = false;
    
    num_santa = 0;
    World.add(world, [leftWall, rightWall, ground, topLine]);

    addOnument();
}

const numSantaDisplay = document.getElementById("numSantaDisplay");



Events.on(engine, "collisionStart", (event) => {
    if (isGameClear) {
        return; // 게임이 클리어되었을 때 추가적인 조작을 막음
    }

    event.pairs.forEach((collision) => {
        if (collision.bodyA.index === collision.bodyB.index) {
            const index = collision.bodyA.index;

            if (index === ONUMENTS.length - 1) {
                return;
            }
            World.remove(world, [collision.bodyA, collision.bodyB]);
            
            const newOnument = ONUMENTS[index + 1];

            const newBody = Bodies.circle(
                collision.collision.supports[0].x,
                collision.collision.supports[0].y,
                newOnument.radius,
                {
                    render: {
                        sprite: { texture: `${newOnument.name}.png`}
                    },
                    index: index + 1,
                }
            );

            World.add(world, newBody);

            if (`${newOnument.name}` === "10_santa") {
                num_santa++;
                numSantaDisplay.innerHTML = num_santa; 
                if (num_santa === 2) {
                    setTimeout(() => {
                       alert('clear!');
                       isGameClear = true;
                    }, 1000);
                }
            }
        }

        if (
            !disableAction &&
            (collision.bodyA.name === "topLine" || collision.bodyB.name === "topLine")) {
            alert("Game over");
            resetGame();
            }  
    });
});

addOnument();