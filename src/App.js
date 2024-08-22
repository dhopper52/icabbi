import React, { useState, useEffect } from "react";
import { DateTime } from "luxon"; // Luxon for date-time manipulation
import axios from "axios"; // Axios for HTTP requests

const inputFormat = "yyyy-MM-dd'T'HH:mm:ss'Z'";
const corsProxy = "https://api.allorigins.win/raw?url=";

const convertToPST = (utcTime, inputFormat) => {
  const utcDateTime = DateTime.fromFormat(utcTime, inputFormat, {
    zone: "utc",
  });
  const pstDateTime = utcDateTime.setZone("America/Los_Angeles");
  return pstDateTime.toFormat(inputFormat);
};
const fetchData = async (url, auth) => {
  const response = await axios.get(corsProxy + url, {
    headers: {
      'Authorization': `Basic ${auth}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

const App = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchDataFromApi = async () => {
    try {
      const uid = new URLSearchParams(window.location.search).get("uid");

      // if (uid === "TAXIPT0008T") {
      const today = DateTime.now().toISODate();
      const startDate = DateTime.fromISO(today).minus({ days: 2 }).toISODate();
      const endDate = startDate;

      console.log(today);
      console.log(startDate);
      console.log(endDate);
      const headers = [
        "ShiftID",
        "VehRegNo",
        "VehRegJur",
        "DriversLicNo",
        "DriversLicJur",
        "ShiftStartDT",
        "ShiftEndDT",
        "TripID",
        "TripTypeCd",
        "TripStatusCd",
        "HailTypeCd",
        "HailInitDT",
        "HailAnswerSecs",
        "HailRqstdLat",
        "HailRqstdLng",
        "PreBookedYN",
        "SvcAnimalYN",
        "VehAssgnmtDT",
        "VehAssgnmtLat",
        "VehAssgnmtLng",
        "PsngrCnt",
        "TripDurationMins",
        "TripDistanceKMs",
        "TtlFareAmt",
        "PickupArrDT",
        "PickupDepDT",
        "PickupLat",
        "PickupLng",
        "DropoffArrDT",
        "DropoffDepDT",
        "DropoffLat",
        "DropoffLng",
      ];

      let xml = `<PassengerTrip xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:noNamespaceSchemaLocation='PassengerTrip.xsd'>\n\t\t`;
      const hsdate = startDate;
      const hedate = endDate;
      const currentDate = endDate;
      // https://api.icabbicanada.com/ca2/bookings/history/?order=closed_date&from=${startDate}T00:30:00&to=${endDate}T23:30:00&Order=id&direction=DESC&status=COMPLETED&offset=${offset}&limit=499
      xml += `<Header>
          <UserID/>
          <ApplicationID/>
          <PTNo>70125</PTNo>
          <NSCNo>200036542</NSCNo>
          <SvcTypCd>TAXI</SvcTypCd>
          <StartDt>${hsdate}Z</StartDt>
          <EndDt>${hedate}Z</EndDt>
        </Header>`;

      const urlcnt = `https://api.icabbicanada.com/ca2/bookings/history/?order=closed_date&from=${startDate}T00:30:00&to=${endDate}T23:30:00&Order=id&direction=DESC&status=COMPLETED&offset=500&limit=499`;
      // const unamecnt = 'c1b675d0140492585511900ad07714c676998b65';
      const unamecnt = "80888b59db96027e1be00d55e22e7cfb1fefbd6d";

      //  const passcnt = '172eeeeb8ef9cd72ff77f7d82b198e64555cb882';
      const passcnt = "32da74a9679f468c6da601ee5672e16291491ebe";
      const authcnt = "ODA4ODhiNTlkYjk2MDI3ZTFiZTAwZDU1ZTIyZTdjZmIxZmVmYmQ2ZDozMmRhNzRhOTY3OWY0NjhjNmRhNjAxZWU1NjcyZTE2MjkxNDkxZWJl";

      // const authcnt = btoa(`${unamecnt}:${passcnt}`);

      const resultscnt = await fetchData(urlcnt, authcnt);

      const totalAvailable = resultscnt.body.total_available;
      let cnt = Math.ceil(totalAvailable / 499);
      if (cnt < 1) cnt = 1;

      xml += "<ShiftData>\n\t\t";

      for (let y = 1; y <= cnt; y++) {
        const offset = (y - 1) * 499;
        const url = `https://api.icabbicanada.com/ca2/bookings/history/?order=closed_date&from=${startDate}T00:30:00&to=${endDate}T23:30:00&Order=id&direction=DESC&status=COMPLETED&offset=${offset}&limit=499`;

        const results = await fetchData(url, authcnt);
        const url1 = `https://api.icabbicanada.com/ca2/drivers/hours/?from=${startDate}T00:30:00&to=${endDate}T23:30:00`;

        const results1 = await fetchData(url1, authcnt);

        results.body.bookings.forEach((result) => {
          const conditionalDate = result.pickup_date.substr(0, 10);
          const conditionalDriverId = result.driver.id;
          let shiftStartDate = 0;
          let shiftEndDate = 0;
          let driversActiveInM = 0;
          let counterr = 0;

          results1.body.hours.forEach((result1) => {
            if (
              conditionalDate ===
                DateTime.fromMillis(result1.from).toISODate() &&
              conditionalDriverId === result1.driver_id
            ) {
              if (counterr === 0) shiftStartDate = result1.from;
              shiftEndDate = result1.to + 59 * 60 + 59;
              driversActiveInM += result1.mins_active;
              counterr++;
            }
          });

          const shiftID = `${conditionalDriverId}${shiftStartDate}${shiftEndDate}${result.trip_id}`;
          const vehRegNo = result.driver.vehicle.reg;
          const vehRegJur = "BC";
          const driversLicNo = result.driver.licence;
          const driversLicJur = "BC";
          const shiftStartDT = convertToPST(
            DateTime.fromMillis(shiftStartDate).toISO(),
            inputFormat
          );
          const shiftEndDT = convertToPST(
            DateTime.fromMillis(shiftEndDate).toISO(),
            inputFormat
          );
          const tripID = result.trip_id;
          const tripTypeCd = "CNVTL";
          let tripStatusCd = result.status;
          if (tripStatusCd === "COMPLETED") tripStatusCd = "CMPLT";
          else if (tripStatusCd === "NOSHOW") tripStatusCd = "NOSHO";
          const hailTypeCd =
            result.source === "DISPATCH" ? "PHONE" : result.source;
          const hailInitDT = convertToPST(result.pickup_date, inputFormat);
          const hailAnswerSecs =
            Math.abs(
              DateTime.fromISO(result.booked_date).toMillis() -
                DateTime.fromISO(result.pickup_date).toMillis()
            ) / 1000;
          const hailRqstdLat = 49.146961;
          const hailRqstdLng = -123.937782;
          const preBookedYN = result.prebooked === 0 ? "N" : "Y";
          const svcAnimalYN = "N";
          const vehAssgnmtDT = convertToPST(
            result.arrive_date || result.contact_date,
            inputFormat
          );
          const vehAssgnmtLat = 49.146961;
          const vehAssgnmtLng = -123.937782;
          const psngrCnt = result.payment.passengers;
          const tripDurationMins = Math.floor(
            Math.abs(
              DateTime.fromISO(result.close_date).toMillis() -
                DateTime.fromISO(result.booked_date).toMillis()
            ) / 60000
          );
          const tripDistanceKMs = result.payment.distance_charged;
          const ttlFareAmt = result.payment.total;
          const pickupArrDT = convertToPST(result.arrive_date, inputFormat);
          const pickupDepDT = convertToPST(result.arrive_date, inputFormat);
          const pickupLat = result.address.actual_lat;
          const pickupLng = result.address.actual_lng;
          const dropoffArrDT = convertToPST(result.close_date, inputFormat);
          const dropoffDepDT = convertToPST(result.close_date, inputFormat);
          const dropoffLat = result.destination.actual_lat;
          const dropoffLng = result.destination.actual_lng;

          xml += `<Shift>\n\t\t`;
          xml += `<ShiftID>${shiftID}</ShiftID>\n\t\t`;
          xml += `<VehRegNo>${vehRegNo}</VehRegNo>\n\t\t`;
          xml += `<VehRegJur>${vehRegJur}</VehRegJur>\n\t\t`;
          xml += `<DriversLicNo>${driversLicNo}</DriversLicNo>\n\t\t`;
          xml += `<DriversLicJur>${driversLicJur}</DriversLicJur>\n\t\t`;
          xml += `<ShiftStartDT>${shiftStartDT}</ShiftStartDT>\n\t\t`;
          xml += `<ShiftEndDT>${shiftEndDT}</ShiftEndDT>\n\t\t`;
          xml += `<TripID>${tripID}</TripID>\n\t\t`;
          xml += `<TripTypeCd>${tripTypeCd}</TripTypeCd>\n\t\t`;
          xml += `<TripStatusCd>${tripStatusCd}</TripStatusCd>\n\t\t`;
          xml += `<HailTypeCd>${hailTypeCd}</HailTypeCd>\n\t\t`;
          xml += `<HailInitDT>${hailInitDT}</HailInitDT>\n\t\t`;
          xml += `<HailAnswerSecs>${hailAnswerSecs}</HailAnswerSecs>\n\t\t`;
          xml += `<HailRqstdLat>${hailRqstdLat}</HailRqstdLat>\n\t\t`;
          xml += `<HailRqstdLng>${hailRqstdLng}</HailRqstdLng>\n\t\t`;
          xml += `<PreBookedYN>${preBookedYN}</PreBookedYN>\n\t\t`;
          xml += `<SvcAnimalYN>${svcAnimalYN}</SvcAnimalYN>\n\t\t`;
          xml += `<VehAssgnmtDT>${vehAssgnmtDT}</VehAssgnmtDT>\n\t\t`;
          xml += `<VehAssgnmtLat>${vehAssgnmtLat}</VehAssgnmtLat>\n\t\t`;
          xml += `<VehAssgnmtLng>${vehAssgnmtLng}</VehAssgnmtLng>\n\t\t`;
          xml += `<PsngrCnt>${psngrCnt}</PsngrCnt>\n\t\t`;
          xml += `<TripDurationMins>${tripDurationMins}</TripDurationMins>\n\t\t`;
          xml += `<TripDistanceKMs>${tripDistanceKMs}</TripDistanceKMs>\n\t\t`;
          xml += `<TtlFareAmt>${ttlFareAmt}</TtlFareAmt>\n\t\t`;
          xml += `<PickupArrDT>${pickupArrDT}</PickupArrDT>\n\t\t`;
          xml += `<PickupDepDT>${pickupDepDT}</PickupDepDT>\n\t\t`;
          xml += `<PickupLat>${pickupLat}</PickupLat>\n\t\t`;
          xml += `<PickupLng>${pickupLng}</PickupLng>\n\t\t`;
          xml += `<DropoffArrDT>${dropoffArrDT}</DropoffArrDT>\n\t\t`;
          xml += `<DropoffDepDT>${dropoffDepDT}</DropoffDepDT>\n\t\t`;
          xml += `<DropoffLat>${dropoffLat}</DropoffLat>\n\t\t`;
          xml += `<DropoffLng>${dropoffLng}</DropoffLng>\n\t\t`;
          xml += `</Shift>\n\t\t`;
        });
      }

      xml += "</ShiftData>\n\t\t</PassengerTrip>";
      console.log(xml);
      setData(xml);
      // }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDataFromApi();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>XML Data</h1>
      <pre>{data}</pre>
    </div>
  );
};

export default App;
