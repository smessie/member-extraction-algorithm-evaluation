import {rdfDereferencer} from "rdf-dereference";
import {RdfStore} from "rdf-stores";
import {Quad, Quad_Object} from "@rdfjs/types";
import {TREE} from "@treecg/types";

// ASSUME TREE PROFILE

const ldesPage = process.argv[2] || 'http://127.0.0.1:3000/ldes/default';

const hrStart = process.hrtime();

const resp = await rdfDereferencer.dereference(ldesPage);

const metadata = RdfStore.createDefault();
let handlingMembers = false;
let memberId: Quad_Object | undefined = undefined;
let memberQuads: Quad[] = [];

let count = 0;
let countQuads = 0;
let memberArrivalTimes: number[] = [];  // Milliseconds since start

function handleFullMember() {
   if (memberId) {
      console.log(memberId.value);
      const hrMember = process.hrtime(hrStart);
      memberArrivalTimes.push(Math.round(hrMember[0] * 1000 + hrMember[1] / 1000000));
      count++;
      countQuads += memberQuads.length;
   }
}

resp.data.on('data', (quad: Quad) => {
   if (quad.predicate.value === TREE.terms.member.value) {
      handlingMembers = true;

      handleFullMember();
      memberId = quad.object;
      memberQuads = [];
   } else if (!handlingMembers) {
      metadata.addQuad(quad);
   } else {
      memberQuads.push(quad);
   }
});

await new Promise<void>((resolve, reject) => {
   resp.data.on('end', () => {
      handleFullMember();
      resolve();
   });
   resp.data.on('error', () => {
      reject();
   });
});

if (process.send) {
   process.send({
      resultMembers: count,
      resultQuads: countQuads,
      memberArrivalTimes,
   });
} else {
   console.log(`No process.send found. Result: ${count} elements with ${countQuads} quads`);
}
