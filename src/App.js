import React, { useState, useEffect } from "react";
import { DateTime } from "luxon"; // Luxon for date-time manipulation
import axios from "axios"; // Axios for HTTP requests

export const Url = {
  BASE_URL: process.env.REACT_APP_BASE_API_URL,
};
const inputFormat = "yyyy-MM-dd'T'HH:mm:ss'Z'";
// const corsProxy = "https://api.allorigins.win/raw?url=";

// const convertToPST = (utcTime, inputFormat) => {
//   const utcDateTime = DateTime.fromFormat(utcTime, inputFormat, {
//     zone: "utc",
//   });
//   const pstDateTime = utcDateTime.setZone("America/Los_Angeles");
//   return pstDateTime.toFormat(inputFormat);
// };
const convertToPST = (utcTime, inputFormat) => {
  console.log({ utcTime });
  if (!utcTime) {
    console.error("Invalid utcTime value:", utcTime);
    return null;
  }

  const utcDateTime = DateTime.fromFormat(utcTime, inputFormat, {
    zone: "utc",
  });

  if (!utcDateTime.isValid) {
    console.error("Invalid utcDateTime format:", utcDateTime.invalidReason);
    return null;
  }

  const pstDateTime = utcDateTime.setZone("America/Los_Angeles");
  return pstDateTime.toFormat(inputFormat);
};

const fetchBooking = async (auth, startDate, endDate, offset) => {
  const response = await axios.get(
    `${Url.BASE_URL}/api/bookings?auth=${auth}&startDate=${startDate}&endDate=${endDate}&offset=${offset}`
  );
  return response.data;
};

const fetchDriver = async (auth, startDate, endDate) => {
  const response = await axios.get(
    `${Url.BASE_URL}/api/driver?auth=${auth}&startDate=${startDate}&endDate=${endDate}`
  );
  return response.data;
};

const App = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDataFromApi = async () => {
    try {
      // const uid = new URLSearchParams(window.location.search).get("uid");
      console.log(DateTime.fromMillis(1724310000).toISODate(),"from millis datessssss");
      // if (uid === "TAXIPT0008T") {
      const today = DateTime.now().toISODate();
      console.log({ today });
      const startDate = DateTime.fromISO(today).minus({ days: 2 }).toISODate();
      console.log(startDate);
      const endDate = startDate;
      console.log({ endDate });

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
      xml += `<Header>
          <UserID/>
          <ApplicationID/>
          <PTNo>70125</PTNo>
          <NSCNo>200036542</NSCNo>
          <SvcTypCd>TAXI</SvcTypCd>
          <StartDt>${hsdate}Z</StartDt>
          <EndDt>${hedate}Z</EndDt>
        </Header>`;

      const authcnt =
        "ODA4ODhiNTlkYjk2MDI3ZTFiZTAwZDU1ZTIyZTdjZmIxZmVmYmQ2ZDozMmRhNzRhOTY3OWY0NjhjNmRhNjAxZWU1NjcyZTE2MjkxNDkxZWJl";

      const resultscnt = await fetchBooking(authcnt, startDate, endDate, 500);

      // `https://api.icabbicanada.com/ca2/bookings/history/?order=closed_date&from=${startDate}T00:30:00&to=${endDate}T23:30:00&Order=id&direction=DESC&status=COMPLETED&offset=500&limit=499`;
      // const unamecnt = 'c1b675d0140492585511900ad07714c676998b65';
      // const unamecnt = "80888b59db96027e1be00d55e22e7cfb1fefbd6d";

      //  const passcnt = '172eeeeb8ef9cd72ff77f7d82b198e64555cb882';
      // const passcnt = "32da74a9679f468c6da601ee5672e16291491ebe";

      // const authcnt = btoa(`${unamecnt}:${passcnt}`);

      // const resultscnt = await fetchData(urlcnt, authcnt);
      console.log(resultscnt, "initial");
      const totalAvailable = resultscnt.body.total_available;
      console.log(totalAvailable);
      let cnt = Math.ceil(totalAvailable / 499);
      if (cnt < 1) cnt = 1;

      xml += "<ShiftData>\n\t\t";

      for (let y = 1; y <= cnt; y++) {
        const offset = (y - 1) * 499;
        const results = await fetchBooking(authcnt, startDate, endDate, offset);
        console.log(results, "innner");

        const results1 = await fetchDriver(authcnt, startDate, endDate);
        console.log({ results1 });

        results?.body?.bookings?.forEach((result) => {
          console.log({ result });
          const conditionalDate = result?.pickup_date?.substr(0, 10);
          const conditionalDriverId = result?.driver?.id;
          let shiftStartDate = 0;
          let shiftEndDate = 0;
          let driversActiveInM = 0;
          let counterr = 0;

          results1?.body?.hours?.forEach((result1) => {
            console.log({ result1 });
            console.log(result1.from, "result1.from");
            console.log(result1?.driver_id, "result1.driver_id");
            console.log(conditionalDate);
            if (
              conditionalDate ===
                DateTime.fromMillis(result1.from).toISODate() &&
              conditionalDriverId === result1?.driver_id
            ) {
              if (counterr === 0) shiftStartDate = result1?.from;
              shiftEndDate = result1.to + 59 * 60 + 59;
              driversActiveInM += result1?.mins_active;
              counterr++;
            }
          });

          const shiftID = `${conditionalDriverId}${shiftStartDate}${shiftEndDate}${result?.trip_id}`;
          console.log({ shiftID });
          const vehRegNo = result?.driver?.vehicle.reg;
          const vehRegJur = "BC";
          const driversLicNo = result?.driver?.licence;
          const driversLicJur = "BC";
          const shiftStartDT = shiftStartDate
            ? convertToPST(
                DateTime.fromMillis(shiftStartDate).toISO(),
                inputFormat
              )
            : null;
          console.log({ shiftStartDT });
          const shiftEndDT = shiftEndDate
            ? convertToPST(
                DateTime.fromMillis(shiftStartDate).toISO(),
                inputFormat
              )
            : null;
          console.log({ shiftEndDT });

          // const shiftEndDT = convertToPST(
          //   DateTime.fromMillis(shiftEndDate).toISO(),
          //   inputFormat
          // );
          const tripID = result?.trip_id;
          const tripTypeCd = "CNVTL";
          let tripStatusCd = result?.status;
          if (tripStatusCd === "COMPLETED") tripStatusCd = "CMPLT";
          else if (tripStatusCd === "NOSHOW") tripStatusCd = "NOSHO";
          const hailTypeCd =
            result?.source === "DISPATCH" ? "PHONE" : result?.source;
          const hailInitDT = convertToPST(result?.pickup_date, inputFormat);
          const hailAnswerSecs =
            Math.abs(
              DateTime.fromISO(result?.booked_date).toMillis() -
                DateTime.fromISO(result?.pickup_date).toMillis()
            ) / 1000;
          const hailRqstdLat = 49.146961;
          const hailRqstdLng = -123.937782;
          const preBookedYN = result?.prebooked === 0 ? "N" : "Y";
          const svcAnimalYN = "N";
          const vehAssgnmtDT = convertToPST(
            result?.arrive_date || result?.contact_date,
            inputFormat
          );
          const vehAssgnmtLat = 49.146961;
          const vehAssgnmtLng = -123.937782;
          const psngrCnt = result?.payment?.passengers;
          const tripDurationMins = Math.floor(
            Math.abs(
              DateTime.fromISO(result?.close_date).toMillis() -
                DateTime.fromISO(result?.booked_date).toMillis()
            ) / 60000
          );
          const tripDistanceKMs = result?.payment?.distance_charged;
          const ttlFareAmt = result?.payment?.total;
          const pickupArrDT = convertToPST(result?.arrive_date, inputFormat);
          const pickupDepDT = convertToPST(result?.arrive_date, inputFormat);
          const pickupLat = result?.address?.actual_lat;
          const pickupLng = result?.address?.actual_lng;
          const dropoffArrDT = convertToPST(result?.close_date, inputFormat);
          const dropoffDepDT = convertToPST(result?.close_date, inputFormat);
          const dropoffLat = result?.destination?.actual_lat;
          const dropoffLng = result?.destination?.actual_lng;

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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (data) {
      const blob = new Blob([data], { type: "text/xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "PassengerTrip.xml";
      a.click();
      URL.revokeObjectURL(url);
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
      <button onClick={handleDownload}>Download XML</button>

      {/* <pre>{data}</pre> */}
    </div>
  );
};

export default App;
