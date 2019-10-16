const { Orm }           = require('../src/fox-orm');

const Chai = require('chai');
const {
    expect,
    assert,
    should,
} = Chai;

const City = Orm.createModel({
    // id: 'empty|number',
    title: 'string|maxLength:100',
    country_id: 'numeric|maximum:1000',
    status: 'default:1|enum:-1,0,1',
}, {
    modelName: 'cities',
});

describe('Record creation', () => {
    it('The function create should return a created record', (done) => {
        City
            .create({ title: 'Test-Tokyo', country_id: 1, status: 1 })
            .then((city) => {
                expect(city.title).equal('Test-Tokyo');
                done();
            })
            .catch((error) => {
                expect(error).equal(null);
                done();
            });
    });

    it('The function create should validate passed data', (done) => {
        City
            .create({ title: '', country_id: 1, status: 1 })
            .then((city) => {
                expect(city).equal(null);
                done();
            })
            .catch((error) => {
                expect(error).not.equal(null);
                done();
            });
    });

    it('The function create should accept array of records to create', (done) => {
        City
            .create([
                { title: 'New-York', country_id: 1, status: 1 },
                { title: 'San-Hose', country_id: 1, status: 1 },
            ])
            .then((city) => {
                expect(city[0].title).equal('New-York');
                expect(city[1].title).equal('San-Hose');
                done();
            })
            .catch((error) => {
                expect(error).equal(null);
                done();
            });
    });
});

describe('Function update', () => {
    it('The function update should return an updated record', (done) => {
        City
            .update({ title: 'Gordon', country_id: 1, status: 1 })
            .where({ title: 'San-Hose' })
            .run()
            .then((city) => {
                expect(city.title).equal('Gordon');
                done();
            })
            .catch((error) => {
                expect(error).equal(null);
                done();
            });
    });
});

describe('Function delete', () => {
    it('The function delete should delete a single record', (done) => {
        City
            .delete({ title: 'Test-Tokyo' })
            .where({ status: 1 })
            .limit(1)
            .run()
            .then((rowsCount) => {
                expect(rowsCount).equal(1);
                done();
            })
            .catch((error) => {
                expect(error).equal(null);
                done();
            });
    });
});

describe('Function findById', () => {
    it('The function findById should return a record', (done) => {
        City
            .findById(1)
            .then((city) => {
                expect(city.title).equal('Абакан');
                done();
            })
            .catch((error) => {
                expect(error).equal(null);
                done();
            });
    });
});

describe('Function findOne', () => {
    it('The function findOne should return a record by given args', (done) => {
        City
            .findOne({ title: 'Абакан' })
            .then((city) => {
                expect(city.id).equal(1);
                done();
            })
            .catch((error) => {
                expect(error).equal(null);
                done();
            });
    });
});

describe('Function select', () => {
    it('The function select should return matched records by given clause', (done) => {
        City
            .select(['id', 'title'])
            .where({ title: 'Абакан' })
            .run()
            .then((cities) => {
                expect(cities[0].id).equal(1);
                expect(cities[0].title).equal('Абакан');
                expect(cities[0].status).equal(undefined);
                done();
            })
            .catch((error) => {
                expect(error).equal(null);
                done();
            });
    });

    it('The function select should be able to accept empty select fields and to chain where clause', (done) => {
        City
            .select()
            .where({ title: 'Абакан' })
            .where({ status: 1 })
            .run()
            .then((cities) => {
                expect(cities[0].title).equal('Абакан');
                expect(cities[0].status).equal(1);
                done();
            })
            .catch((error) => {
                expect(error).equal(null);
                done();
            });
    });
});

describe('Function limit', () => {
    it('The function select limit 1 should return a single record', (done) => {
        City
            .select()
            .where({ title: 'Абакан', status: 1 })
            .limit(1)
            .run()
            .then((cities) => {
                expect(cities.title).equal('Абакан');
                done();
            })
            .catch((error) => {
                expect(error).equal(null);
                done();
            });
    });

    it('The function select limit > 1 should return result records', (done) => {
        City
            .select()
            .where({ status: 1 })
            .limit(3)
            .run()
            .then((cities) => {
                expect(cities.length).equal(3);
                done();
            })
            .catch((error) => {
                expect(error).equal(null);
                done();
            });
    });
});

describe('Function orderBy', () => {
    it('The function orderBy should return sorted by ascending records', (done) => {
        City
            .select()
            .where({ status: 1 })
            .orderBy({ 'id': 'asc' })
            .limit(3)
            .run()
            .then((cities) => {
                expect(cities[0].id).below(cities[1].id);
                done();
            })
            .catch((error) => {
                expect(error).equal(null);
                done();
            });
    });

    it('The function orderBy should return sorted by descending records', (done) => {
        City
            .select()
            .where({ status: 1 })
            .orderBy({ 'id': 'desc' })
            .limit(3)
            .run()
            .then((cities) => {
                expect(cities[0].id).above(cities[1].id);
                done();
            })
            .catch((error) => {
                expect(error).equal(null);
                done();
            });
    });

    it('The function orderBy should throw an error if wrong direction specified', (done) => {
        City
            .select()
            .where({ status: 1 })
            .orderBy({ 'id': 'basc' })
            .limit(3)
            .run()
            .then((cities) => {
                expect(cities).toBe(null);
                done();
            })
            .catch((error) => {
                expect(error).not.equal(null);
                done();
            });
    });
});

describe('hasOne relation tests', () => {

    const Session = Orm.createModel({
        user_id: 'empty|number',
        token: 'string|maximum:500',
        refresh_token: 'string|maximum:200',
        date_created: 'date',
        date_updated: 'date',
        status: 'default:1|enum:-1,0,1',
    }, {
        modelName: 'sessions',
    });

    const User = Orm.createModel({
        // id: 'empty|number',
        code: 'string|maximum:3',
        status: 'default:1|enum:-1,0,1',
    }, {
        modelName: 'users',
        hasOne: {
            target: Session,
            foreignKey: 'user_id'
        }
    });

    const User2 = Orm.createModel({
        // id: 'empty|number',
        code: 'string|maximum:3',
        status: 'default:1|enum:-1,0,1',
    }, {
        modelName: 'users',
        hasOne: {
            target: Session,
        }
    });

    it('The hasOne relation should automagically return a record from related table', (done) => {
        User
            .findById(7)
            .then((user) => {
                expect(user.token).to.be.ok;
                done();
            })
            .catch((error) => {
                console.log('error:', error);
                expect(error).equal(null);
                done();
            });
    });

    it('The hasOne relation should build foreign key name automagically', (done) => {
        User2
            .findById(7)
            .then((user) => {
                expect(user.token).to.be.ok;
                done();
            })
            .catch((error) => {
                console.log('error:', error);
                expect(error).equal(null);
                done();
            });
    });
});