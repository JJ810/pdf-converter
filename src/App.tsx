import React, { useState, useEffect } from "react";
import firebase from "firebase";
import { submit, getLast } from "./utils/api";
import { IFile } from "./types";
import { v4 as uuidv4 } from "uuid";
import "./App.css";

firebase.initializeApp({
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: "",
});

function App() {
  const [files, setFiles] = useState<File[]>();
  const [textArray, setTextArray] = useState<IFile[]>();
  const [loading, setLoading] = useState<string>();
  const [deviceId, setDeviceId] = useState<string>("");
  const storage = firebase.storage();

  useEffect(() => {
    let uuid = localStorage.deviceId ? localStorage.deviceId : uuidv4();
    setDeviceId(uuid);
    localStorage.deviceId = uuid;
    getLast(uuid)
      .then((res) => setTextArray(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      let { files } = e.target;
      let items = [];
      for (let i = 0; i < files.length; i++) items.push(files[i]);
      setFiles(items);
    }
  };

  const handleSubmit = async () => {
    setLoading("Uploading...");
    let fileNames: string[] = [];
    if (typeof files !== "undefined" && files.length > 0) {
      for (const file of files) {
        await storage.ref(`/pdfs/${file.name}`).put(file);
        fileNames.push(file.name);
      }
      setLoading("Extracting...");
      submit(fileNames, deviceId)
        .then((res) => {
          setLoading("");
          setTextArray(res.data);
        })
        .catch((err) => console.error(err));
    }
  };

  return (
    <div className="App">
      {loading && <h3>{loading}</h3>}
      <label htmlFor="input_file">Select File...</label>
      {loading !== "" && (
        <div>
          {files &&
            files.length > 0 &&
            files.map((file: File, index: number) => (
              <p key={index}>{file.name}</p>
            ))}
        </div>
      )}
      <input
        id="input_file"
        type="file"
        onChange={handleSelectFile}
        accept=".pdf"
        multiple
      />
      {typeof textArray !== "undefined" &&
        textArray.length > 0 &&
        textArray.map((text, index) => (
          <div className="content" key={index}>
            <p>{text.title}</p>
            <textarea value={text.content} contentEditable={false} />
          </div>
        ))}
      <button onClick={handleSubmit} disabled={!files}>
        SUBMIT
      </button>
    </div>
  );
}

export default App;
