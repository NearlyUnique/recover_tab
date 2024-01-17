class SkipTestError extends Error { }
export function RunTests(tests) {
    let pass = 0, fail = 0, skipped = 0;
    Object.keys(tests).forEach(testName => {
        let result = "";
        let fn = console.log;
        try {
            tests[testName]();
            result = `PASSED "${testName}"`;
            pass++;
        } catch (e) {
            if (e instanceof SkipTestError) {
                result = `SKIPPED "${testName}" '${e.message}'`;
                skipped++;
            } else {
                const st = e.stack.split('\n');
                result = `FAILED "${testName}" ${e}\n\t${st[1].split('file://')[1]}\n\t${st[2].split('file://')[1]}`;
                fn = console.error;
                fail++;
            }
        } finally {
            fn(result);
        }
    });
    console.log(`\nPassed: ${pass}, Failed: ${fail}, Skipped ${skipped}`);
}

export function assertHasValue(value) {
    if (value === null || value === undefined) {
        throw new Error(`MISSING_VALUE actual '${value}'`);
    }
}
function expandObjectForLog(obj) {
    let simple = `${obj}`;
    if (simple === "[object Object]") {
        return "\n"+JSON.stringify(obj)+"\n";
    }
    return simple;
}
export function assertEqual(expected, actual, msg) {
    if (!areDeeplyEqual(expected, actual)) {
        msg = msg ? (` (${msg})`) : ("");
        throw new Error(`NOT_EQUAL expected '${expandObjectForLog(expected)}', actual '${expandObjectForLog(actual)}'${msg}`);
    }
}
export function assertHasNoValue(actual, msg) {
    if (actual !== null && actual !== undefined) {
        msg = msg ? (` (${msg})`) : ("");
        throw new Error(`HAS_VALUE expected no value, got '${expandObjectForLog(actual)}'${msg}`);
    }
}
export function skip(reason) {
    throw new SkipTestError(reason);
}
export function log(message) {
    console.log(`LOG: ${message}`);
}

function areDeeplyEqual(obj1, obj2) {
    if (obj1 === obj2) return true;

    if (Array.isArray(obj1) && Array.isArray(obj2)) {

        if (obj1.length !== obj2.length) return false;

        return obj1.every((elem, index) => {
            return areDeeplyEqual(elem, obj2[index]);
        })
    }

    if (typeof obj1 === "object" && typeof obj2 === "object" && obj1 !== null && obj2 !== null) {
        if (Array.isArray(obj1) || Array.isArray(obj2)) return false;

        const keys1 = Object.keys(obj1)
        const keys2 = Object.keys(obj2)

        if (keys1.length !== keys2.length || !keys1.every(key => keys2.includes(key))) return false;

        for (let key in obj1) {
            // console.log(obj1[key], obj2[key])
            let isEqual = areDeeplyEqual(obj1[key], obj2[key])
            if (!isEqual) { return false; }
        }
        return true;
    }
    return false;
}
