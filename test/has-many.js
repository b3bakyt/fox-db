const { Orm }           = require('../src/fox-orm');

const Chai = require('chai');
const {
    expect,
    assert,
    should,
} = Chai;

const DoctorSpecialities = Orm.createModel({
    id: 'empty|number',
    doctor_id: 'empty|number',
    medical_speciality_id: 'empty|number',
    clinic_branch_id: 'empty|number',
    date_created: 'date',
    status: 'default:1|enum:-1,0,1',
}, {
    modelName: 'translations',
});

const Doctors = Orm.createModel({
    id: 'empty|number',
    date_career_begin: 'date',
    date_career_end: 'date',
    cv: 'empty|string:200',
    fio: 'string|maximum:200',
    inn: 'string|maximum:200',
    phone: 'string|maximum:20',
    email: 'string|maximum:100',
    image_path: 'string|maximum:100',
    skype: 'string|maximum:100',
    status: 'default:1|enum:-1,0,1',
}, {
    modelName: 'countries',
    hasMany: {
        target: DoctorSpecialities,
    }
});

describe('hasMany relation tests', () => {

    it('The hasMany relation should automagically return a record from related table', (done) => {
        Doctors
            .findOne({ fio: 'Barak Obama' })
            .then((doctors) => {
                expect(doctors.fio).equal('Barak Obama');
                expect(doctors.doctor_specialities.length).equal(6);
                done();
            })
            .catch((error) => {
                console.log('error:', error);
                expect(error).equal(null);
                done();
            });
    });
});
