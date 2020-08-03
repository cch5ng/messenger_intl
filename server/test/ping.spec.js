//const chai = require("chai");
//const chaiHttp = require("chai-http");
//const app = require("../app.js");

//chai.should();
//chai.use(chaiHttp);

test('dummy', () => {
  expect(1 + 2).toBe(3);
});

// describe("/POST ping", () => {
//   it.skip("it should return 400", done => {
//     chai
//       .request(app)
//       .post(`/ping/`)
//       .send({ teamName: "Shums" })
//       .end((err, res) => {
//         res.should.have.status(400);
//         res.body.should.have
//           .property("response")
//           .eql("Shums is not part of the team. Modify your .env");
//         done();
//       });
//   });
// });
