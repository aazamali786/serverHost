// Super Admin routes
router.get("/owners", userController.getAllOwners);
router.put("/verify-owner/:id", userController.verifyOwner);
router.put("/unverify-owner/:id", userController.unverifyOwner);
