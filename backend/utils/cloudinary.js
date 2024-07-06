import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: "dhcawltsr",
  api_key: "474763912135238",
  api_secret: "HN30t2ATyLTmrY4ftRSXQPJ6d2g",
});

export default cloudinary.v2;
