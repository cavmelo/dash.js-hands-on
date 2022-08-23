/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */

var ThroughputBasedRule;

// Rule that selects the lowest possible bitrate
function ThroughputBasedRuleClass() {

    let factory = dashjs.FactoryMaker;
    let SwitchRequest = factory.getClassFactoryByName('SwitchRequest');
    let StreamController = factory.getSingletonFactoryByName('StreamController');
    let DashMetrics = factory.getSingletonFactoryByName('DashMetrics');
    let DashManifestModel = factory.getSingletonFactoryByName('DashManifestModel');
    let context = this.context;
    let instance;
    let bandwidths = [];

    function setup() {
    }

    function getBytesLength(request) {
        return request.trace.reduce((a, b) => a + b.b[0], 0);
    }

    // Always use lowest bitrate
    function getMaxIndex(rulesContext) {
        // here you can get some informations about metrics for example, to implement the rule
        let dashManifest = DashManifestModel(context).getInstance();

        const mediaInfo = rulesContext.getMediaInfo();
        let mediaType = rulesContext.getMediaInfo().type;
        let streamInfo = rulesContext.getStreamInfo();
        let isDynamic = streamInfo && streamInfo.manifestInfo && streamInfo.manifestInfo.isDynamic;

        // Get metrics
        let dashMetrics = DashMetrics(context).getInstance();
        let currentBufferLevel = dashMetrics.getCurrentBufferLevel(mediaType);
        console.log("currentBufferLevel: "+currentBufferLevel);
        let currentRequest = dashMetrics.getCurrentHttpRequest(mediaType);
        console.log("currentRequest: "+JSON.stringify(currentRequest));

        //Get list of qualities
        let abrController = rulesContext.getAbrController();
        let bitrateList = abrController.getBitrateList(mediaInfo);
        console.log("bitrateList: "+JSON.stringify(bitrateList));

        // Get current quality index
        let streamController = StreamController(context).getInstance();
        let currentQualityIndex = abrController.getQualityFor(mediaType, streamController.getActiveStreamInfo());
        console.log("currentQualityIndex: "+currentQualityIndex);

        // Get Bandwidth current representation
        let currentRepresentation = rulesContext.getRepresentationInfo();
        let currentBandwidth = dashManifest.getBandwidth(currentRepresentation);
        console.log("currentBandwidth: "+currentBandwidth);

        // Get Throughput
        let throughputHistory = abrController.getThroughputHistory();
        let throughput = throughputHistory.getAverageThroughput(mediaType, isDynamic)*1000;
        console.log("throughput: "+throughput);

        let safeThroughput = throughputHistory.getSafeAverageThroughput(mediaType, isDynamic)*1000;
        console.log("safeThroughput: "+safeThroughput);

        count = rulesContext.getMediaInfo().representationCount;


        for (i = 0; i < count; i += 1) {
            bandwidths.push(rulesContext.getMediaInfo().bitrateList[i].bandwidth);
        }
        if (throughput <= currentBandwidth) {
            for (i = currentQualityIndex - 1; i > 0; i -= 1) {
                if (bandwidths[i] <= throughput) {
                    break;
                }
            }
            q = i;
            p = SwitchRequest.PRIORITY.STRONG;

            console.log("[CustomRules] SwitchRequest: q=" + q + "/" + (count - 1) + " (" + bandwidths[q] + ")"/* + ", p=" + p*/);
            return SwitchRequest(context).create(q, {name : 'Throughput rule'},  p);
        } else {
            for (i = count - 1; i > currentQualityIndex; i -= 1) {
                if (throughput >= (bandwidths[i])) {
                    // logger.debug("[CustomRules][" + mediaType + "][DownloadRatioRule] bw = " + calculatedBandwidth + " results[i] * switchUpRatioSafetyFactor =" + (bandwidths[i] * switchUpRatioSafetyFactor) + " with i=" + i);
                    break;
                }
            }

            q = i;
            p = SwitchRequest.PRIORITY.STRONG;

            console.log("[CustomRules] SwitchRequest: q=" + q + "/" + (count - 1) + " (" + bandwidths[q] + ")"/* + ", p=" + p*/);
            return SwitchRequest(context).create(q, {name : 'Throughput rule'},  p);
        }
    }

    instance = {
        getMaxIndex: getMaxIndex
    };

    setup();

    return instance;
}

ThroughputBasedRuleClass.__dashjs_factory_name = 'ThroughputBasedRule';
ThroughputBasedRule = dashjs.FactoryMaker.getClassFactory(ThroughputBasedRuleClass);
