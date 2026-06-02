class BaseProvider {
  constructor(name) {
    this.name = name;
  }

  async search(query) {
    return [];
  }
}

module.exports = BaseProvider;
