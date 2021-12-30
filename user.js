module.exports = class User {
    constructor() {
        this.login = false;
        this.username = null;
        this.accounts = [];
        this.first_name = null;
        this.last_name = null;
        this.email = null;
    };

    clear() {
        this.login = false;
        this.username = null;
        this.accounts = [];
        this.first_name = null;
        this.last_name = null;
        this.email = null;
    };
};