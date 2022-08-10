"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const core = __importStar(require("@actions/core"));
const xpath = __importStar(require("xpath"));
const xmldom_1 = require("@xmldom/xmldom");
const file = core.getInput('file');
const regex = core.getInput('regex');
const xpath_location = core.getInput('xpath');
/// run
async function run() {
    try {
        const doc = read_csproj(file);
        const verElement = get_csproj_version(doc);
        if (verElement === null || verElement === void 0 ? void 0 : verElement.nodeValue) {
            const ver = parse_version(verElement.nodeValue);
            if (ver) {
                core.setOutput('version', verElement.nodeValue);
            }
            else {
                core.setFailed("failed to parse .csproj version");
            }
        }
        else {
            core.setFailed("invalid .csproj does not contain version");
        }
    }
    catch (error) {
        core.setFailed(error.message);
    }
}
function parse_version(version) {
    var _a, _b, _c, _d, _e;
    const match = version.match(regex);
    if (match) {
        console.dir({ groups: match.groups });
        return [(_a = match.groups) === null || _a === void 0 ? void 0 : _a.major, (_b = match.groups) === null || _b === void 0 ? void 0 : _b.minor, (_c = match.groups) === null || _c === void 0 ? void 0 : _c.patch, (_d = match.groups) === null || _d === void 0 ? void 0 : _d.prerelease, (_e = match.groups) === null || _e === void 0 ? void 0 : _e.buildmetadata];
    }
    return null;
}
function get_csproj_version(doc) {
    const verElement = xpath.select(xpath_location, doc);
    if (verElement === undefined ||
        verElement.length == 0 ||
        verElement[0] === undefined) {
        throw Error("Could not locate version element. Check XPath expression or .csproj file");
    }
    if (verElement) {
        return verElement[0].firstChild;
    }
    return null;
}
function read_csproj(csprojfile) {
    const xml = fs.readFileSync(csprojfile, 'utf8');
    console.log("%s", xml);
    const parser = new xmldom_1.DOMParser();
    const doc = parser.parseFromString(xml, "application/xml");
    console.dir({ doc });
    if (doc == null) {
        throw Error("error while parsing");
    }
    return doc;
}
run();
