const { Orm }           = require('../src/fox-orm');

const Chai = require('chai');
const {
    expect,
    assert,
    should,
} = Chai;


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
