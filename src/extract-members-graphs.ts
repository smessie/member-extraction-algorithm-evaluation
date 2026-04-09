import {rdfDereferencer} from "rdf-dereference";
import {RdfStore} from "rdf-stores";
import {TREE} from "@treecg/types";
import {extract} from "member-extraction-algorithm";

// ASSUME NAMED GRAPHS LDES

const ldesPage = process.argv[2] || 'http://127.0.0.1:3000/ldes/default';

const hrStart = process.hrtime();

const resp = await rdfDereferencer.dereference(ldesPage);
const data = RdfStore.createDefault();
await new Promise((resolve, reject) => {
   data.import(resp.data).on("end", resolve).on("error", reject);
});

const members = data.getQuads(null, TREE.terms.member, null).map(quad => quad.object);

let count = 0;
let countQuads = 0;
let memberArrivalTimes: number[] = [];  // Milliseconds since start

for (const member of members) {
   const quads = extract(data, [member])[0];
   console.log(member.value);
   const hrMember = process.hrtime(hrStart);
   memberArrivalTimes.push(Math.round(hrMember[0] * 1000 + hrMember[1] / 1000000));
   count++;
   countQuads += quads.length;
}

if (process.send) {
   process.send({
      resultMembers: count,
      resultQuads: countQuads,
      memberArrivalTimes,
   });
} else {
   console.log(`No process.send found. Result: ${count} elements with ${countQuads} quads`);
}
