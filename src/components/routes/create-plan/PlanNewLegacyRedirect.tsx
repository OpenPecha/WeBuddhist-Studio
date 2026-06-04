import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getSeries } from "@/components/routes/create-series/api/seriesApi";
import { parsePlanNewFromSeriesState } from "./planNewFromSeriesState";
import { ROUTES } from "@/routes/paths";

/** Sends legacy `/plan/new` (with optional series state) to group-scoped create. */
const PlanNewLegacyRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fromSeries = parsePlanNewFromSeriesState(location.state);

  useEffect(() => {
    if (!fromSeries) {
      navigate(ROUTES.groups, { replace: true });
      return;
    }

    let cancelled = false;
    void getSeries(fromSeries.seriesId)
      .then((series) => {
        if (cancelled) return;
        if (series.group_id) {
          navigate(ROUTES.groupPlanNew(series.group_id), {
            replace: true,
            state: location.state,
          });
        } else {
          navigate(ROUTES.groups, { replace: true });
        }
      })
      .catch(() => {
        if (!cancelled) navigate(ROUTES.groups, { replace: true });
      });

    return () => {
      cancelled = true;
    };
  }, [fromSeries, location.state, navigate]);

  return null;
};

export default PlanNewLegacyRedirect;
