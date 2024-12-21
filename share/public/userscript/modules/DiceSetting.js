class DiceSetting {
  _name = 'NoName';
  _dices = 1;
  _faces = 6;
  _dicesitems = [['A', 'B', 'C', 'D', 'E', 'F',],];
  constructor() {
    this.assign(Array.from(arguments));
  }
  get name() { return this._name; }
  set name(value) { this._name = value; }
  get dices() { return this._dices; }
  set dices(value) { this._dices = clamp(value, 1, 10); }
  get faces() { return this._faces; }
  set faces(value) { this._faces = clamp(value, 1, 9999); }
  get items() { return this._items; }
  set items(value) { this._items = value; }
  get flattenItems() {
    return this.items.map(item => item.join('\n') + '\n').join('\n') + '\n';
  }
  set flattenItems(src) {
    this.items = src.trim().split(/\n\n/)
      .map(item => item.trim().split(/\n/).filter(item => !!item))
      .filter(item => !!item && item.length > 0);
  }
  toJSON() { return [this.name, this.dices, this.faces, ...this.items]; }
  assign(src) {
    if (!Array.isArray(src) || src.length == 0) { return; }
    [this.name, this.dices, this.faces, ...this.items] = src;
  }
  replace(html, results) {
    return html.replace(
      results.join(' '),
      results.map((result, index) => {
        const item = this.items[index % this.items.length];
        return `<br>${result} ${item[(result - 1) % item.length]}`;
      }).join('') + '<br>'
    )
  }
}

class DiceSettings {
  constructor() {
    this.assign(Array.from(arguments));
  }
  get names() {
    return Object.keys(this).sort();
  }
  toJSON() { return this.names.map(name => this[name].toJSON()); }
  assign(src) {
    if (!Array.isArray(src) || src.length == 0) { return; }
    src.forEach((setting) => {
      this.add(new DiceSetting(...setting));
    });
  }
  add(diceSetting) {
    if (!diceSetting instanceof DiceSetting) { return; }
    this[diceSetting.name] = diceSetting;
    return this;
  }
  remove(diceSetting) {
    if (!diceSetting instanceof DiceSetting) { return; }
    delete this[diceSetting.name];
    return this;
  }
}