const { dir } = require("console");
const fs = require("fs/promises");

(async () => {
  const createFile = async (path) => {
    try {    
      const existingFileHandle = await fs.open(path, "r");
      existingFileHandle.close();

      return console.log(`The file ${path} already exists.`);
    } catch (e) {
      const newFileHandle = await fs.open(path, "w");
      console.log("A new file was successfully created.");
      newFileHandle.close();
    }
  };

  const deleteFile = async (path) => {
  try {
      await fs.unlink(path);
    } catch (e) {
      if( e.code === "ENOENT" ) {
        console.log("No file at this path to remove.");
      } else {
        console.log("An error occured while removing the file: ");
        console.log(e);
      }
    }
  };

  const renameFile = async (oldPath, newPath) => {
    try {
      await fs.rename(oldPath, newPath);
      console.log("The file was successfully renamed.")
    } catch (e) {
      if( e.code === "ENOENT" ) {
        console.log("No file at this path to rename or the destination does not exists.");
      } else {
        console.log("An error occured while removing the file: ");
        console.log(e);
      }
    }
  };

  let addedContent;

  const addFile = async (path, content) => {
    if( addedContent == content ) return;
    try {
      const fileHnadle = await fs.open(path, "a");
      fileHnadle.write(content);
      addedContent = content;
    } catch (e) {
      console.log("An error occured while adding to the file: ");
      console.log(e);
    }
  };

  // commands
  const CREATE_FILE = "create a file";
  const DELETE_FILE = "delete a file";
  const RENAME_FILE = "rename the file";
  const ADD_FILE = "add the file";
 
  const commandFileHandler = await fs.open("./command.txt", "r");

  commandFileHandler.on("change", async () => {
    const size = (await commandFileHandler.stat()).size;
    const buff = Buffer.alloc(size);
    const offset = 0;
    const length = buff.byteLength;
    const position = 0;

    await commandFileHandler.read(buff, offset, length, position);

    const command = buff.toString("utf-8");

    // create a file:
     if (command.includes(CREATE_FILE)) {
      const filePath = command.substring(CREATE_FILE.length + 1);
      createFile(filePath);
    }

    // delete the file
    if(command.includes(DELETE_FILE)){
      const filePath = command.substring(DELETE_FILE.length + 1);
      deleteFile(filePath);
    }

    // rename the file 
    if(command.includes(RENAME_FILE)){
      const _idx = command.indexOf(" to ");
      const oldFilePath = command.substring(RENAME_FILE.length + 1, _idx);
      const newFilePath = command.substring(_idx + 4);

      renameFile(oldFilePath, newFilePath);
    }

    // add to file 
    if(command.includes(ADD_FILE)) {
      const _idx = command.indexOf(" this content ");
      const filePath = command.substring(ADD_FILE.length + 1, _idx);
      const content = command.substring(_idx + 15);

      addFile(filePath, content);
    }
  });

  // watcher...
  const watcher = fs.watch("./command.txt");
  for await (const event of watcher) {
    if (event.eventType === "change") {
      commandFileHandler.emit("change");
    }
  }
})();
