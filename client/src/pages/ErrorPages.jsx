import ErrorPage from '../components/ErrorPage.jsx';

/**
 * The three reservation error pages the assignment specifies.
 *
 * Each name matches the error the server sends back, so the booking form can
 * simply navigate to "/" + error:
 *     { "error": "unavaliable_room" }  ->  /unavaliable_room
 *
 * The English wording is copied from the assignment, typos included, so the
 * pages read exactly as the screenshots show them.
 */

export function UnavaliableRoom() {
  return (
    <ErrorPage
      title="The room is not avaliable at the dates requested"
      subtitle="No reservation made !!"
    />
  );
}

export function InvalidRoom() {
  return (
    <ErrorPage title="The room does not exist in the hotel" subtitle="No reservation made !!" />
  );
}

export function InvalidDates() {
  return <ErrorPage title="Dates in reservation are invalid" subtitle="No reservation made" />;
}
