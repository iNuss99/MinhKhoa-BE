// using withRouter in class-component
import { useParams, useNavigate, useLocation } from "react-router-dom";

function withRouter(Component) {
  return (props) => (
    <Component {...props} params={useParams()} navigate={useNavigate()} location={useLocation()} />
  );
}
export default withRouter;
