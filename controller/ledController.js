// Funciones y Variables exportadas
// const { toggleLed } = require("../helpers/myLedFunction");
// const ledVariables = require("../helpers/myLedFunction").ledVariables;
const NetworkScanner = require("network-scanner-js");
const snmp = require("net-snmp");
const ping = require("ping");
const getIpRange = require("get-ip-range").getIPRange;

//models
const Hosts = require("../models/hosts");
const Networks = require("../models/networks");

//class netscan
const netScan = new NetworkScanner();

//Rutascontroller

exports.getIndex = (req, res) => {
  //   toggleLed();
  //   res.json({ status: ledVariables.isOn });
  res.json({ status: "Ruta Funcionando" });
};

exports.getHosts = (req, res) => {
  let myMachines = [];

  const networkScan = () => {
    netScan.ipScan("192.168.1.0-254", (host) => {
      let hostresult = {
        ipAddress: host.ip_address,
        status: host.status,
        hostName: null,
      };

      let session = snmp.createSession(hostresult.ipAddress, "R2");

      session.get(
        ["1.3.6.1.2.1.1.5.0", "1.3.6.1.2.1.1.1.0"],
        (error, varbinds) => {
          if (error) {
            console.error(
              `El Host ${hostresult.ipAddress} No tiene un Servicio SNMP Disponible o no encuenta el dato requerido`
            );
          } else {
            for (var i = 0; i < varbinds.length; i++) {
              if (snmp.isVarbindError(varbinds[i])) {
                console.error(snmp.varbindError(varbinds[i]));
              } else {
                hostresult.hostname = (
                  varbinds[0].oid +
                  "=" +
                  varbinds[0].value
                ).slice(18);
                hostresult.operatingSystem = (
                  varbinds[1].oid +
                  "=" +
                  varbinds[1].value
                ).slice(94, -34);
              }
            }
            myMachines = [...myMachines, hostresult];
            let myHosts = JSON.stringify(myMachines);

            console.table(myHosts);

            Hosts.findOne({ ipAddress: hostresult.ipAddress }, (err) => {
              if (err) console.error(err);
            }).then((host) => {
              if (host) {
                console.log("Este host esta agregado");
              } else {
                const hosts = new Hosts({
                  hostName: hostresult.hostname,
                  ipAddress: hostresult.ipAddress,
                  status: hostresult.status,
                  operatingSystem: hostresult.operatingSystem,
                  networkName: "6144cf415556e92f683d3706",
                });

                hosts.save();
              }
            });
          }
        }
      );
    });
  };
  networkScan();

  Hosts.find().then((hosts) => {
    res.status(201).json({ hosts });
  });
};

exports.updateHosts = (req, res, next) => {
  Hosts.find()
    .then((hosts) => {
      const myHosts = hosts.map((host) => {
        return host.ipAddress;
      });

      return myHosts;
    })
    .then((myHosts) => {
      myHosts.map((host) => {
        ping.sys.probe(host, (isAlive) => {
          let msg = isAlive
            ? `El host ${host} esta activo`
            : `El host ${host} esta inactivo`;
          if (msg === `El host ${host} esta activo`) {
            Hosts.updateMany(
              { ipAddress: host },
              { status: "online" },
              (err) => {
                if (err) throw err;
              }
            );
          } else {
            Hosts.updateMany(
              { ipAddress: host },
              { status: "offline" },
              (err) => {
                if (err) throw err;
              }
            );
          }
        });
      });
    });

  Hosts.find().then((hosts) => {
    res.status(201).json({ hosts });
  });
};

exports.pruebaScan = async (req, res, next) => {
  // Network.find()
  //   .then((network) => {
  //     const data = network.map((n) => {
  //       const subnet = n.subnet.split(".");
  //       subnet.pop();
  //       // subnet.push("254");
  //       const subnetConverted = subnet.join(".");
  //       // return subnetConverted;

  //       return subnetConverted
  //     });

  //     return data;
  //   })
  //   .then((data) => {

  //     // for(var i = 1; i <= 254; i++){
  //     //     console.log(data[i])
  //     // }

  //   });

  // const networkScan = async () => {
  //   const networks = await Networks.find();

  //   var VMs = [];
  //   networks.forEach((net) => {
  //     const range = getIpRange(`${net.subnet}/${net.cidr}`);
  //     const networkHosts = `${net.subnet}-${range.length - 2}`;

  //     netScan.ipScan(networkHosts, (host) => {
  //       let hostresult = {
  //         ipAddress: host.ip_address,
  //         status: host.status,
  //         netMask: net.cidr,
  //         snmpCommunity: net.snmpCommunity,
  //         networkName: net.networkName,
  //         operatingSystem: 'WWWWWW'

  //       };

  //       VMs = [...VMs, hostresult];

  //       const hosts = new Hosts(VMs)

  //       hosts.save()
  //     });

  //   });
  // };

  // networkScan();

  let myMachines = [];
  const networkScan = async () => {
    const networks = await Networks.find();

    networks.forEach((net) => {
      const range = getIpRange(`${net.subnet}/${net.cidr}`);
      const networkHosts = `${net.subnet}-${range.length - 2}`;
      console.log(networkHosts);

      netScan.ipScan(networkHosts, (host) => {
        let hostresult = {
          ipAddress: host.ip_address,
          status: host.status,
          hostName: null,
          netMask: net.cidr,
          snmpCommunity: net.snmpCommunity,
          networkName: net.networkName,
        };

        let session = snmp.createSession(
          hostresult.ipAddress,
          net.snmpCommunity
        );

        session.get(
          ["1.3.6.1.2.1.1.5.0", "1.3.6.1.2.1.1.1.0"],
          (error, varbinds) => {
            if (error) {
              console.error(
                `El Host ${hostresult.ipAddress} No tiene un Servicio SNMP Disponible o no encuenta el dato requerido`
              );
            } else {
              for (var i = 0; i < varbinds.length; i++) {
                if (snmp.isVarbindError(varbinds[i])) {
                  console.error(snmp.varbindError(varbinds[i]));
                } else {
                  hostresult.hostname = (
                    varbinds[0].oid +
                    "=" +
                    varbinds[0].value
                  ).slice(18);
                  hostresult.operatingSystem = (
                    varbinds[1].oid +
                    "=" +
                    varbinds[1].value
                  );
                }
              }
              myMachines = [...myMachines, hostresult];
              let myHosts = JSON.stringify(myMachines);

              console.table(myHosts);

              Hosts.findOne({ ipAddress: hostresult.ipAddress }, (err) => {
                if (err) console.error(err);
              }).then((host) => {
                if (host) {
                  console.log("Este host esta agregado");
                } else {
                  const hosts = new Hosts({
                    hostName: hostresult.hostname,
                    ipAddress: hostresult.ipAddress,
                    status: hostresult.status,
                    operatingSystem: hostresult.operatingSystem,
                    networkName: "6144cf415556e92f683d3706",
                  });

                  hosts.save();
                }
              });
            }
          }
        );
      });
    });
  };

  networkScan();

  res.status(201).json({ ok: true });
};
