global.exports('enable', (source: number) => {
    emit('binoculars:enable', source);
});

global.exports('disable', (source: number) => {
    emit('binoculars:disable', source);
});
