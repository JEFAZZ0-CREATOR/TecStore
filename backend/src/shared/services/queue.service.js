const queue = [];
exports.publish = async (job) => {
  queue.push({ ...job, createdAt: new Date().toISOString() });
  return job;
};
exports.getQueue = () => queue;
