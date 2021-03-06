const fs = require('fs');
const _ = require('underscore');


// https://gist.github.com/jed/982883
// Returns a random v4 UUID
function uuid(a) {
    return a ? (a ^ Math.random() * 16 >> a / 4).toString(16) : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, uuid)
}

function loggd(path) {

    /*
    save
    @param data to be saved
    @param2 callback
    @returns {data that was saved}
    */

    this.save = (sData, cb) => {
        if (typeof sData !== "object") {
            cb("'data' given is not a object", null);
            return;
        }
        sData["_id"] = uuid();
        fs.exists(path, (exists) => {
            if (exists) {
                fs.readFile(path, 'utf8', (err, data) => {
                    if (err) throw err;
                    // the array on the file

                    let parsed_data;

                    // if the file EXISTS but is EMPTY!
                    // then we need to init a array
                    if (data.length === 0) {
                        parsed_data = [];
                    } else {
                        parsed_data = JSON.parse(data);
                    }

                    parsed_data.push(sData);
                    // add to that array and save
                    fs.writeFile(path, JSON.stringify(parsed_data), (err) => {
                        if (err) throw err;
                        cb(null, sData);
                    });
                });
            } else {
                // make new array
                fs.writeFile(path, JSON.stringify(new Array(sData)), (err) => {
                    if (err) throw err;
                    cb(null, sData);
                });
            }
        });
    }

    /*
    read
    @param callback 
    @returns {data from the file}
    */

    this.read = (cb) => {
        fs.exists(path, (exists) => {
            if (exists) {
                fs.readFile(path, 'utf8', (err, data) => {
                    if (err) throw err;
                    // throw back the data
                    if (data.length > 0) {
                        cb(null, JSON.parse(data))
                    }
                    else {
                        // if file is empty, return an empty Array
                        cb(null, [])
                    }
                })

            } else {
                cb("File doesn't exists", null);
            }
        });

    }

    /*
    find
    @param criteria against which the data will be filtered 
    @param2 callback 
    @returns {filtered data from the file}
    */

    this.find = (d, cb) => {
        fs.exists(path, (exists) => {
            if (exists) {
                fs.readFile(path, 'utf8', (err, data) => {
                    if (err) throw err;
                    data = JSON.parse(data);
                    let c = 0;
                    let res = [];
                    data.forEach((e, i, arr) => {
                        c++;
                        if (_.isMatch(e, d)) {
                            res.push(e);
                        }
                        if (c === arr.length) {
                            if (res.length > 0) {
                                cb(null, res)
                            } else {
                                cb(null, {})
                            }
                        }
                    })
                });
            } else {
                cb("File doesn't exists", null);
            }
        });
    }

    /*
    findOne
    @param criteria against which the data will be filtered 
    @param2 callback 
    @returns {first instance of the object thats matched against the given criteria}
    */

    this.findOne = (d, cb) => {
        fs.exists(path, (exists) => {
            if (exists) {
                fs.readFile(path, 'utf8', (err, data) => {
                    if (err) throw err;
                    let m = 0;
                    data = JSON.parse(data);
                    for (let i = 0; i < data.length; i++) {

                        if (_.isMatch(data[i], d)) {
                            m++;
                            cb(null, data[i]);
                            break;
                        }
                        if (i === data.length - 1 && m == 0) {
                            cb("No object found with property given", null)
                        }
                    }
                });
            } else {
                cb("File doesn't exists", null);
            }
        });
    }

    /*
    updateOne
    @param criteria 
    @param2 updated data for that specific object
    @param3 callback 
    @returns {updated object, but only the first occurance of it, in the file}
    */

    this.updateOne = (d, uData, cb) => {
        fs.exists(path, (exists) => {
            if (exists) {
                fs.readFile(path, 'utf8', (err, data) => {
                    if (err) throw err;
                    data = JSON.parse(data);
                    let m = 0;
                    for (let i = 0; i < data.length; i++) {
                        let e = data[i]
                        if (_.isMatch(e, d)) {
                            m++;
                            _.extend(e, uData);
                            data[i] = e;
                            fs.writeFile(path, JSON.stringify(data), (err) => {
                                if (err) throw err;
                                cb(null, e)
                            });
                            break;
                        }
                        if (i == data.length - 1 && m == 0) {
                            cb("No object found with property given", null)
                        }
                    }
                });
            } else {
                cb("File doesn't exists", null)
            }
        });

    }

    /*
    updateOne
    @param criteria 
    @param2 updated data for that specific object
    @param3 callback 
    @returns {updated object}
    */

    this.update = (d, uData, cb) => {
        fs.exists(path, (exists) => {
            if (exists) {
                fs.readFile(path, 'utf8', (err, data) => {
                    if (err) throw err;
                    data = JSON.parse(data);

                    let c = 0;
                    let m = 0;
                    let res = []
                    for (let i = 0; i < data.length; i++) {
                        let e = data[i]
                        if (_.isMatch(e, d)) {
                            res.push(e);
                            m++;
                            _.extend(e, uData);
                            data[i] = e;
                        }
                        if (i == data.length - 1) {
                            if (m !== 0) {
                                fs.writeFile(path, JSON.stringify(data), (err, data) => {
                                    if (err) throw err;
                                    cb(null, res);
                                });
                            } else {
                                cb("No object found with property given", null)
                            }
                        }
                    }
                });
            } else {
                cb("File doesn't exists", null);
            }
        });

    }

    /*
    remove
    @param criteria
    @param2 callback 
    @returns {the deleted object}
    */

    this.remove = (d, cb) => {
        fs.exists(path, (exists) => {
            if (exists) {
                fs.readFile(path, 'utf8', (err, data) => {
                    if (err) throw err;
                    data = JSON.parse(data);
                    let m = 0;
                    let res = [];

                    for (let i = 0; i < data.length; i++) {
                        let e = data[i];
                        if (_.isMatch(e, d)) {
                            res.push(e);
                            m++;
                        }

                        if (i == data.length - 1) {
                            if (m !== 0) {
                                let c = 0;
                                res.forEach((e, i, arr) => {
                                    data.splice(data.indexOf(e), 1);
                                    c++;
                                    if (c == arr.length) {
                                        fs.writeFile(path, JSON.stringify(data), (err) => {
                                            if (err) throw err
                                            cb(null, res);
                                        })
                                    }
                                })
                            } else {
                                cb("No object found with property given", null)
                            }
                        }
                    }
                })
            } else {
                cb("File doesn't exists", null);
            }
        })
    }
    return this;
}

module.exports = loggd;
