const notifications = [];
let sequenceId = 0;

const nextId = () => {
  sequenceId += 1;
  return sequenceId;
};

module.exports = {
  notifications,
  nextId,
};
