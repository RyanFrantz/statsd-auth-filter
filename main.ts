// --unstable --allow-net
// PoC: Listen on udp/4000 for statsd metrics with prefixed secrets/API tokens.
const server  = Deno.listenDatagram({ port: 4000, transport: "udp" });
while(server) {
  const [msg, addr] = await server.receive();
  const decodedMsg = new TextDecoder().decode(msg);
  /* Match a standard Statsd message with a custom prefix representing a secret
   * like the following example:
   * SECRET||frantz.com.logins:2222222|c|@0.1
   * metric:value|type
   * metric:value|type|(optional sample rate)
   * value can optionally be signed
   * /(?<secret>[\w.-]+)\|\|(?<metric>[\w.]+):(?<value>[-+]?\d+)\|(?<type>\w)(\|@(?<sampleRate>\d+\.\d+))?/gm
  */
  // We also need to support:
  // multiple metrics on a single line, delimited by newlines
  //  for ^ perhaps we split messages on newlines into an array and iterate over them
  // FIXME: Use RegExp() and set modifiers?
  //const re = /(?<secret>[\w.-]+)\|\|(?<metric>[\w.]+):(?<value>[-+]?\d+)\|(?<type>\w)(\|@(?<sampleRate>\d+\.\d+))?/gm
  const re = /(?<secret>[\w.-]+)\|\|(?<metric>[\w.]+):(?<value>[-+]?\d+)\|(?<type>\w)(\|@(?<sampleRate>\d+\.\d+))?/
  const metrics = decodedMsg.split("\n");
  for (const metric of metrics) {
    const match = metric.match(re);
    if (match) {
      console.log(decodedMsg);
    } else {
      console.log("No token present in request!");
    }
  }
}
