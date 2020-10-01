import axios from "axios";

const baseUrl = "https://us-central1-lucky7-engine.cloudfunctions.net/api";

export const submit = (files: string[], uuid: string) =>
  axios.post(`${baseUrl}/upload`, { files, uuid });

export const getLast = (uuid: string) => axios.get(`${baseUrl}/${uuid}`);
