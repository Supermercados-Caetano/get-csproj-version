
import * as fs from 'fs';
import * as core from '@actions/core';
import * as xpath from 'xpath';
import { DOMParser } from '@xmldom/xmldom';

const file = core.getInput('file');
const regex = core.getInput('regex');
const xpath_location = core.getInput('xpath');


/// run
async function run()
{
    try
    {
        const doc = read_csproj(file);
        const verElement = get_csproj_version(doc);
        if (verElement?.nodeValue)
        {
            const ver = parse_version(verElement.nodeValue);
            if (ver)
            {
				console.log(`version: ${verElement.nodeValue}`);
                core.setOutput('version', verElement.nodeValue);
            }
            else
            {
                core.setFailed("failed to parse .csproj version");
            }
        }
        else
        {
            core.setFailed("invalid .csproj does not contain version");
        }
    }
    catch (error: any)
    {
        core.setFailed(error.message);
    }
}

function parse_version(version: string)
{
    const match = version.match(regex);
    if (match)
    {
        //console.dir({groups: match.groups});
        return [match.groups?.major, match.groups?.minor, match.groups?.patch, match.groups?.prerelease, match.groups?.buildmetadata];
    }
    return null
}

function get_csproj_version(doc: Document)
{
    const verElement = <Node[]>xpath.select(xpath_location, doc);

    if (verElement === undefined ||
        verElement.length == 0   ||
        verElement[0] === undefined)
    {
        throw Error("Could not locate version element. Check XPath expression or .csproj file");
    }

    if (verElement)
    {
        return verElement[0].firstChild;
    }
    return null;
}

function read_csproj(csprojfile: string)
{
    const xml = fs.readFileSync(csprojfile, 'utf8');
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "application/xml");
    if (doc == null)
    {
		console.log("%s", xml);
		console.dir({doc});
        throw Error("error while parsing");
    }
    return doc;
}

run()
