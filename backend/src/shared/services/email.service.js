exports.sendEmail = async ({ to, subject, message }) => {
  console.log('Email simulated:', { to, subject, message });
  return true;
};
