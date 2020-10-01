const functions = require("firebase-functions");
const getRawBody = require("raw-body");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const pdf = require("pdf-parse");

admin.initializeApp();

const db = admin.firestore();
const storage = admin.storage();
const app = express();

app.use(cors({ origin: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/:uuid", async (req, res) => {
  let data = [];
  const uuid = req.params.uuid;
  await db
    .collection("files")
    .get()
    .then((snapshot) => {
      if (!snapshot.empty) {
        snapshot.forEach((doc) => {
          if (doc.data().uuid === uuid)
            data.push({ title: doc.data().title, content: doc.data().content });
        });
      }
    })
    .then(() => res.status(200).send(data))
    .catch((err) => res.status(400).send(err));
});

app.post("/upload", async (req, res) => {
  const bucket = storage.bucket();
  const fileNames = req.body.files;
  const { uuid } = req.body;
  let text = [];
  if (fileNames && fileNames.length > 0) {
    for (const fileName of fileNames) {
      let file = bucket.file(`pdfs/${fileName}`);
      if (file) {
        const dataBuffer = await getRawBody(file.createReadStream());
        const data = await pdf(dataBuffer);
        await db
          .collection("files")
          .get()
          .then(async (snapshot) => {
            if (snapshot.empty) {
              db.collection("files").add({
                title: fileName,
                content: data.text,
                uuid: uuid,
              });
            } else {
              let exists = false;
              for (const doc of snapshot.docs) {
                if (doc.data().title === fileName && doc.data().uuid === uuid) {
                  await doc.ref.update({ content: data.text });
                  exists = true;
                }
              }
              if (!exists)
                db.collection("files").add({
                  title: fileName,
                  content: data.text,
                  uuid: uuid,
                });
            }
          });

        text.push({ title: fileName, content: data.text });
      }
    }
    res.status(200).send(text);
  } else {
    res.status(400).send(`You should provide correct file names!`);
  }
});

exports.api = functions.https.onRequest(app);
