import User from "../models/user.js";

const userController = {};
userController.viewProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).send("User not found");
    }
    console.log(user);
    res.render("profile", { user });
  } catch (error) {
    res.status(500).send("Server error");
  }
};

userController.deleteProfile = async (req, res) => {
  try {
    await User.deleteById(req.user.id);
    req.logout();
    res.redirect("/");
  } catch (error) {
    res.status(500).send("Server error");
  }
};

export default userController;
