import {rdfDereferencer} from "rdf-dereference";
import {RdfStore} from "rdf-stores";
import {TREE} from "@treecg/types";
import {CBDShapeExtractor} from "extract-cbd-shape";

// ASSUME NORMAL LDES

const ldesPage = process.argv[2] || 'http://127.0.0.1:3000/ldes/default';
const cbdSpecifyShape = process.argv[3] === "true";
const cbdDefaultGraph = process.argv[4] === "true";

let shapeId = undefined;

const hrStart = process.hrtime();

// Fetch page
const resp = await rdfDereferencer.dereference(ldesPage);
const data = RdfStore.createDefault();
await new Promise((resolve, reject) => {
   data.import(resp.data).on("end", resolve).on("error", reject);
});

const shapesGraphStore = RdfStore.createDefault();
if (cbdSpecifyShape) {
   const shapeIds = data.getQuads(null, TREE.terms.shape).map(quad => quad.object);
   if (shapeIds.length !== 1) {
      console.error(`Expected to find exactly one shapeId, but found ${shapeIds.length}!`);
   } else {
      shapeId = shapeIds[0];

      if (shapeId.termType === 'NamedNode') {
         const respShape = await rdfDereferencer.dereference(shapeId.value);
         await new Promise((resolve, reject) => {
            shapesGraphStore.import(respShape.data).on("end", resolve).on("error", reject);
         });
      }
   }
}

const members = data.getQuads(null, TREE.terms.member, null).map(quad => quad.object);

const extractor = new CBDShapeExtractor((cbdSpecifyShape && shapeId?.termType === 'NamedNode') ? shapesGraphStore : data, undefined, {
   cbdDefaultGraph: cbdDefaultGraph,
});

let count = 0;
let countQuads = 0;
let memberArrivalTimes: number[] = [];  // Milliseconds since start

const promises = [];
for (const member of members) {
   const promise = extractor.extract(data, member, shapeId, members).then(quads => {
      console.log(member.value);
      const hrMember = process.hrtime(hrStart);
      memberArrivalTimes.push(Math.round(hrMember[0] * 1000 + hrMember[1] / 1000000));
      count++;
      countQuads += quads.length;
   });
   promises.push(promise);
}
await Promise.all(promises);

if (process.send) {
   process.send({
      resultMembers: count,
      resultQuads: countQuads,
      memberArrivalTimes,
   });
} else {
   console.log(`No process.send found. Result: ${count} elements with ${countQuads} quads`);
}
