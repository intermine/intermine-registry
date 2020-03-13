const request = require('supertest');
const app = require('../app');
const { 
    setupDatabase, 
    userOne, 
    flyMine, 
    chickpeaMine, 
    flymineUpdate, 
    changeNamespace
} = require('./fixtures/db');

jest.setTimeout(15000);

beforeAll(async () => {
    await setupDatabase();
    
    // Save an instance to the database before testing
    await request(app).post('/service/instances/')
        .auth(userOne.user, userOne.password)
        .send(chickpeaMine);
});

test('POST /instances : Should add an instance to the InterMine Registry', async () => {
    await request(app).post('/service/instances/')
        .auth(userOne.user, userOne.password)
        .send(flyMine)
        .expect(201);
});

test('POST /instances : Shoud not add an existing namespace to the InterMine Registry', async () => {
    await request(app).post('/service/instances/')
        .auth(userOne.user, userOne.password)
        .send(flyMine)
        .expect(409);
});

test('GET /instances : Should get all InterMine Registry instances information when there are no params', async () => {
    const response = await request(app).get('/service/instances/')
        .send()
        .expect(200);
    
    // No of returned instances should be correct
    expect(response.body.instances).toHaveLength(2);
});

test('GET /instances : Should get the correct InterMine Registry instance information when parameter q is passed', async () => {
    const response = await request(app).get('/service/instances?q=flymine')
        .send()
        .expect(200);

    // Response namespace should be correct
    expect(response.body.instances[0].namespace).toMatch('flymine');
});

test('GET /instances : Should not return any InterMine Registry instances with "isProduction": true when parameter "mines=dev" is passed', async () => {
    const response = await request(app).get('/service/instances?mines=dev')
        .send()
        .expect(200);
    
    // Check value of 'isProduction' for each instance
    // Value of 'isProduction' should not be true
    const instances = response.body.instances;
    instances.forEach(instance => expect(instance.isProduction).not.toBe(true));
});

test('GET /instances : Should not return any InterMine Registry instances with "isProduction": false when parameter "mines=prod" is passed', async () => {
    const response = await request(app).get('/service/instances?mines=prod')
        .send()
        .expect(200);
    
    // Check value of "isProduction" for each instance
    // Value of 'isProduction' should not be false
    const instances = response.body.instances;
    instances.forEach(instance => expect(instance.isProduction).not.toBe(false));
});

test('GET /instances : Should return a count of InterMine Registry instances when parameter "mines=all" is passed', async () => {
    const response = await request(app).get('/service/instances?mines=all')
        .send()
        .expect(200);

    // No of returned instances should be correct
    expect(response.body.instances).toHaveLength(2);
});

test('PUT /instances : Should update the given InterMine Registry instance only', async () => {
    await request(app).put('/service/instances/2')
        .auth(userOne.user, userOne.password)
        .send(flymineUpdate)
        .expect(201);
});

test('PUT /instances : Should not allow a namespace to be changed', async () => {
    await request(app).put('/service/instances/2')
        .auth(userOne.user, userOne.password)
        .send(changeNamespace)
        .expect(409);
});

test('DELETE /instances : Should delete the given InterMine Registry instance only', async () => {
    await request(app).delete('/service/instances/2')
        .auth(userOne.user, userOne.password)
        .send()
        .expect(200);
});
