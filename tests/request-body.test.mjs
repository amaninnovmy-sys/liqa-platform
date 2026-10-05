import {test} from 'node:test';import assert from 'node:assert/strict';import {readJson} from '../lib/request-body.mjs';
const req=(body,headers={})=>new Request('https://example.test',{method:'POST',body,headers});
test('bounded JSON preserves Arabic',async()=>assert.deepEqual(await readJson(req('{"name":"لِقا"}')),{name:'لِقا'}));
test('declared oversized body is rejected',async()=>assert.rejects(readJson(req('{}',{'content-length':'99999'})),e=>e.status===413));
test('undeclared oversized body is rejected',async()=>assert.rejects(readJson(req('x'.repeat(20000))),e=>e.status===413));
test('malformed JSON is rejected',async()=>assert.rejects(readJson(req('{broken}')),/JSON/));
