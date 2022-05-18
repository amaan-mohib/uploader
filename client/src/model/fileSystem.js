export class Directory {
    #id = "";
    #parent = null;
    #name = "";
    #children = new Map();
    #metadata = null;

    constructor(id, directory) {
        if (id != null && directory != null) {
            this.id = id;
            this.name = directory.name;
            this.metadata = directory;
        }
    }
    get id() {
        return this.#id
    }
    set id(id) {
        this.#id = id;
    }
    get name() {
        return this.#name;
    }
    get parent() {
        return this.#parent;
    }

    get path() {
        if (this.parent) {
            return `${this.parent.path}/${this.id}`;
        }

        return this.id;
    }

    set name(newName) {
        if (!newName || typeof newName !== 'string' || !newName.trim().length) {
            throw new Error('Item name must be a non empty string');
        }

        if (newName.includes('/')) {
            throw new Error("Item name contains invalid symbol");
        }

        if (this.parent && this.parent.hasItem(newName)) {
            throw new Error(`Item with name of "${newName}" already exists in this directory`);
        }

        this.#name = newName.trim();
    }

    set parent(newParent) {
        if (newParent !== this.#parent) {
            const prevParent = this.#parent;
            this.#parent = newParent;

            if (prevParent) {
                prevParent.removeItem(this.name)
            }

            if (newParent) {
                newParent.insertItem(this)
            }
        }
    }

    get metadata() {
        return this.#metadata;
    }
    set metadata(obj) {
        this.#metadata = obj;
    }

    get content() {
        return Array.from(this.#children.values());
    }

    hasItem(itemName) {
        return this.#children.has(itemName);
    }

    insertItem(item) {
        if (this.hasItem(item.name)) return true;
        if (item === this) throw new Error('Directory cannot contain itself');
        let parent = this.#parent;
        while (parent !== null) {
            if (parent === item) {
                throw new Error('Directory cannot contain one of its ancestors');
            }
            parent = parent.parent;
        }
        this.#children.set(item.name, item);
        item.parent = this;

        return this.hasItem(item.name);
    }

    getItem(itemName) {
        return this.#children.get(itemName) || null;
    }

    removeItem(itemName) {
        const item = this.getItem(itemName);

        if (item) {
            this.#children.delete(itemName);
            item.parent = null;
        }

        return !this.hasItem(itemName);
    }
}

class FileSystem {
    #self = new Directory(null, null);
    #currentDirectory = this.#self;
    #currentDirectoryPath = [this.#currentDirectory];
    #built = false;

    init(uid) {
        this.#self = new Directory(uid, { name: "Home", id: uid, parentId: null });
        this.#currentDirectory = this.#self;
        this.#currentDirectoryPath = [this.#currentDirectory];
    }

    get currentDirectory() {
        return this.#currentDirectory;
    }

    get currentDirectoryPath() {
        return this.#currentDirectoryPath.map(dir => ({ id: dir.id, name: dir.name }));
    }

    get root() {
        return this.#self;
    }

    get parent() {
        return null;
    }

    get name() {
        return this.root.name;
    }

    get content() {
        return this.currentDirectory.content;
    }

    get built() {
        return this.#built;
    }

    createDirectory(id, directory) {
        const newDir = new Directory(id, directory);

        const inserted = this.currentDirectory.insertItem(newDir);

        return inserted ? newDir : null;
    }

    insertItem(item) {
        return this.currentDirectory.insertItem(item);
    }

    getItem(itemName) {
        return this.currentDirectory.getItem(itemName);
    }

    hasItem(itemName) {
        return this.currentDirectory.hasItem(itemName);
    }

    removeItem(itemName) {
        return this.currentDirectory.removeItem(itemName);
    }

    renameItem(currentName, newName) {
        const item = this.getItem(currentName);

        if (item) {
            item.name = newName;
            this.removeItem(currentName);
            this.insertItem(item);
            return item;
        }

        return null;
    }

    openDirectory(id) {
        let dir = this.findDirectory(this.root, id);

        if (!(dir && dir instanceof Directory)) return null;

        const dirPath = [dir];
        let parent = dir.parent;
        while (parent) {
            dirPath.unshift(parent);
            parent = parent.parent;
        }

        this.#currentDirectory = dir;
        this.#currentDirectoryPath = dirPath;

        return dir;
    }

    findDirectory(directory, id) {
        if (id === this.currentDirectory.id) return this.currentDirectory;
        if (directory.id === id) return directory;
        else {
            let children = directory.content;
            for (const child of children) {
                const result = this.findDirectory(child, id);
                if (result != null) return result;
            }
        }
        return null;
    }

    buildTree(folders, uid) {
        this.openDirectory(uid);
        folders.forEach((folder) => {
            const dir = this.openDirectory(folder.parentId);
            dir != null && this.createDirectory(folder.id, folder);
        })
        this.openDirectory(uid);
        this.#built = true;
    }
}

const fileSystem = new FileSystem();
Object.freeze(fileSystem);

export default fileSystem;