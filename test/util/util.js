
const delay = ((n) => {
    return new Promise((res) => {
        setTimeout(res, n);
    });
});

const write = ((s) => {
    return new Promise((res, rej) => {
        process.stdout.write(s, (err) => {
            if (!!err) {
                rej(err);
            } else {
                res();
            }
        });
    });
});

module.exports = { delay, write };