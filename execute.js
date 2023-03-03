const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const outputPath = path.join(__dirname, "outputs");

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

const removeFile = async (filePath, outputPath, jobId, outType) => {
  try {
    fs.unlinkSync(filePath);
  } catch (err) {
    console.log("file deletion error-->", err);
  }
  try {
    // if (outType === "out")
    fs.unlinkSync(path.join(outputPath, `${jobId}.${outType}`));
  } catch (err) {
    console.log("file deletion error-->", err);
  }
  try {
    fs.unlinkSync(path.join(outputPath, `${jobId}.txt`));
  } catch (err) {
    console.log("file deletion error-->", err);
  }
};

/////////////////////////////////////////////C++

const executeCpp = (filePath, input = "") => {
  const jobId = path.basename(filePath).split(".")[0];
  console.log("jobId==>", jobId);
  const outPath = path.join(outputPath, `${jobId}.out`);
  const inPath = path.join(outputPath, `${jobId}.txt`);
  fs.writeFileSync(inPath, input);

  return new Promise((resolve, reject) => {
    exec(
      `g++-11 -fconcepts-ts ${filePath} -o ${outPath} && cd ${outputPath} && gtimeout 4s ./${jobId}.out < ${jobId}.txt`,
      { maxBuffer: 1024 * 1024 * 256 },
      (error, stdout, stderr) => {
        removeFile(filePath, outputPath, jobId, "out");
        if (error) reject({ error, stderr });
        if (stderr) reject(stderr);
        resolve(stdout);
      }
    );
  });
};

///////////////////////////////////////////////PYTHON

const executePy = (filePath, input = "") => {
  const jobId = path.basename(filePath).split(".")[0];
  console.log("jobId==>", jobId);
  // const outPath = path.join(outputPath, `${jobId}.out`);
  const inPath = path.join(outputPath, `${jobId}.txt`);
  fs.writeFileSync(inPath, input);
  const pp = input ? `< ${jobId}.txt` : "";
  return new Promise((resolve, reject) => {
    exec(
      `cd ${outputPath} && python3 ${filePath} ${pp}`,
      { maxBuffer: 1024 * 1024 * 256 },
      (error, stdout, stderr) => {
        removeFile(filePath, outputPath, jobId, "");
        if (error) reject({ error, stderr });
        if (stderr) reject(stderr);
        resolve(stdout);
      }
    );
  });
};

////////////////////////////////JAVA

const removeFolder = async (outPath) => {
  try {
    fs.rmSync(outPath, { recursive: true, force: true });
  } catch (err) {
    console.log("remove folder error---->", err);
  }
};

const executeJava = (filePath, input = "") => {
  
  const jobId = path.basename(filePath).split(".")[0];
  console.log("jobId==>", jobId);

  const outPath = path.join(outputPath, `/${jobId}`);
  fs.mkdirSync(outPath, { recursive: true });

  const inPath = path.join(outPath, `${jobId}.txt`);
  fs.writeFileSync(inPath, input);

  console.log("outpath-->", outPath);

  return new Promise((resolve, reject) => {
    exec(
      `javac -d ${outPath} ${filePath}  && cd ${outPath} && java Main < ${jobId}.txt`,
      { maxBuffer: 1024 * 1024 * 256 },
      (error, stdout, stderr) => {
        removeFile(filePath, outputPath, jobId, "java");
        removeFolder(outPath);
        if (error) reject({ error, stderr });
        if (stderr) reject(stderr);
        resolve(stdout);
      }
    );
  });
};

module.exports = {
  executeCpp,
  executePy,
  executeJava,
};
