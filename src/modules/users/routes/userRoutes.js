const router = require("express").Router();
const userController = require("../controllers/userController");
const userValidation = require("../validations/userValidation");
const validate = require("../../../middleware/validatorMiddleware");
const authorize = require("../../../middleware/rbacMiddleware");
const authenticate = require("../../../middleware/authMiddleware");
const upload = require("../../../middleware/multerMiddlleware");

router.use(authenticate);

router.get(
  "/by-mess/:messId",
  authorize("findByMess", "users"),
  validate(userValidation.getUsersByMess),
  userController.getUsersByMess
);
router
  .route("/")
  .get(
    authorize("find", "users"),
    validate(userValidation.getUsers),
    userController.getUsers
  );

router
  .route("/:id")
  .get(authorize("findOne", "users"), userController.getUser)
  .put(
    authorize("update", "users"),
    validate(userValidation.updateUser),
    upload.single("profileImage"),
    userController.updateUser
  )
  .delete(authorize("delete", "users"), userController.deleteUser);

module.exports = router;
