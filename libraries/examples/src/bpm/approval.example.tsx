/** @jsx hm */
import { hm } from "aelastics-synthesis";
import * as bpm from "./BPM.jsx-comps";

let SeqApproval = (
  <bpm.Process name="SeqApproval">
    <bpm.Sequence>
      <bpm.Task name="write" />
      <bpm.Task name="approve" />
    </bpm.Sequence>
  </bpm.Process>
);
