const KEYS_TOGGLE = 56; // F9 key
const KEYS_ZOOM_IN_KEY = 241; // Scroll Up
const KEYS_ZOOM_OUT_KEY = 242; // Scroll Down

let lookingThroughBinoculars = false;
let camera = null;
let scaleform = null;

let currentFov = 60;

const minFovValue = 20;
const maxFovValue = 60;
const zoomSpeed = 20;

const hudComponentsToHide = [1, 2, 3, 4, 6, 7, 8, 9, 13, 11, 12, 15, 18, 19];
function hideHud(): void {
    HideHelpTextThisFrame();
    HideHudAndRadarThisFrame();

    hudComponentsToHide.forEach(id => {
        HideHudComponentThisFrame(id);
    });
}

function enable(): void {
    const playerPed = PlayerPedId();

    SendNuiMessage(JSON.stringify({ type: 'show', zoom: 5 }));
    TaskStartScenarioInPlace(playerPed, 'WORLD_HUMAN_BINOCULARS', 0, false);

    lookingThroughBinoculars = true;

    camera = CreateCam('DEFAULT_SCRIPTED_FLY_CAMERA', true);

    AttachCamToEntity(camera, playerPed, 0, 0, 1, true);
    SetCamRot(camera, 0, 0, GetEntityHeading(playerPed), 0);
    SetCamFov(camera, minFovValue);
    RenderScriptCams(true, false, 0, true, false);

    scaleform = RequestScaleformMovie('BINOCULARS');
}

function disable(): void {
    const playerPed = PlayerPedId();

    SendNuiMessage(JSON.stringify({ type: 'hide' }));

    ClearPedTasks(playerPed);

    SetScaleformMovieAsNoLongerNeeded(scaleform);

    RenderScriptCams(false, false, 0, true, false);
    DestroyCam(camera, false);

    lookingThroughBinoculars = false;
}

function toggleBinoculars(): void {
    if (!lookingThroughBinoculars) {
        enable();
    } else {
        disable();
    }
}

function zoom(zoomIn: boolean): void {
    let newFovValue = minFovValue;
    const cameraFov = GetCamFov(camera);

    if (zoomIn) {
        newFovValue = cameraFov + (Math.min(currentFov - zoomSpeed, maxFovValue) - cameraFov) * 0.1;
    } else {
        newFovValue = cameraFov + (Math.min(currentFov + zoomSpeed, maxFovValue) - cameraFov) * 0.1;
    }


    if (Math.abs(newFovValue - cameraFov) < 0.3) {
        newFovValue = cameraFov;
    }

    currentFov = newFovValue;
    SetCamFov(camera, newFovValue);
}

function checkMovement(): void {
    let rightAxisX = GetDisabledControlNormal(0, 220);
    let rightAxisY = GetDisabledControlNormal(0, 221);
    let rotation = GetCamRot(camera, 2);

    const speed = 8;

    const newZ = rotation[2] + rightAxisX * -1.0 * speed * 0.25;
    const newX = Math.max(Math.min(20.0, rotation[0] + rightAxisY * -1.0 * speed * 0.25), -89.5);

    SetCamRot(camera, newX, 0.0, newZ, 2);
}

setTick(() => {
    if (IsControlJustReleased(0, KEYS_TOGGLE)) {
        toggleBinoculars();
    }

    if (lookingThroughBinoculars) {
        DrawScaleformMovieFullscreen(scaleform, 255, 255, 255, 255, 0)
        hideHud();

        if ((IsControlJustReleased(0, KEYS_ZOOM_IN_KEY))) {
            zoom(true);
        } else if (IsControlJustReleased(0, KEYS_ZOOM_OUT_KEY)) {
            zoom(false);
        }

        checkMovement();
    }
});

onNet('binoculars:enable', () => {
    if (!lookingThroughBinoculars) {
        enable();
    }
});

onNet('binoculars:disable', () => {
    if (lookingThroughBinoculars) {
        disable();
    }
});
