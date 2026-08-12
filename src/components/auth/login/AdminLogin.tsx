import Login from "./Login";

/** Staff/reviewer login — rejects accounts that aren't SUPER_ADMIN or REVIEWER. */
const AdminLogin = () => <Login variant="admin" />;

export default AdminLogin;
