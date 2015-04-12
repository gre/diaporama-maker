
const types = {
  fromImage: "string",
  toImage: "string",
  toProjectUrl: "function",
  diaporamaZipUrl: "function",
  diaporamaJsonUrl: "function",
  bootstrapDiaporama: "function",
  saveDiaporama: "function",
  fetchDiaporama: "function",
  listItems: "function",
  uploadFiles: "function"
};

export default function () {
  if (!DiaporamaMakerAPI) throw new Error("DiaporamaMakerAPI is not defined");
  const errors = [];
  for (let k in DiaporamaMakerAPI) {
    if (!(k in types))
      errors.push("DiaporamaMakerAPI."+k+" is unknown API.");
  }
  for (let k in types) {
    if (!(k in DiaporamaMakerAPI))
      errors.push("DiaporamaMakerAPI."+k+" is required.");
    else if (typeof DiaporamaMakerAPI[k] !== types[k])
      errors.push("DiaporamaMakerAPI."+k+" has wrong type: "+(typeof DiaporamaMakerAPI[k])+" instead of "+types[k]);
  }
  if (errors.length) {
    throw new Error(errors.join("\n"));
  }
}
