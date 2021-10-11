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

  // const net = new Networks({

  //   snmpCommunity: 'R2',
  //   subnet: '192.168.11.0',
  //   cidr: '27',
  //   networkName: 'R2',
  //   level: '2'
  // })

  // net.save()

  res.json({ status: "Ruta Funcionando" });
};

exports.getNetworks = (req, res) => {
  Networks.find()
    .then((network) => {
      res.status(201).json(network);
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.scanNetwork = (req, res) => {
  const SNMP = req.body.snmpCommunity;
  const subnet = req.body.subnet;
  const cidr = req.body.cidr;
  const networkID = req.body.networkID;

  const range = getIpRange(`${subnet}/${cidr}`);
  const networkHosts = `${subnet}-${range.length - 2}`;

  const networkScan = async () => {
    netScan.ipScan(networkHosts, async (host) => {
      let hostResult = {
        ipAddress: host.ip_address,
        status: host.status,
      };

      let session = snmp.createSession(hostResult.ipAddress, SNMP);

      session.get(
        ["1.3.6.1.2.1.1.5.0", "1.3.6.1.2.1.1.1.0"],
        (error, varbinds) => {
          if (error) {
            console.error(
              `El Host ${hostResult.ipAddress} No tiene un Servicio SNMP Disponible o no encuenta el dato requerido`
            );
          } else {
            for (var i = 0; i < varbinds.length; i++) {
              if (snmp.isVarbindError(varbinds[i])) {
                console.error(snmp.varbindError(varbinds[i]));
              } else {
                hostResult.hostname = (
                  varbinds[0].oid +
                  "=" +
                  varbinds[0].value
                ).slice(18);
                hostResult.operatingSystem = (
                  varbinds[1].oid +
                  "=" +
                  varbinds[1].value
                )
              }
            }

            Hosts.findOne({ ipAddress: hostResult.ipAddress }, (err) => {
              if (err) console.error(err);
            }).then(async (host) => {
              if (host) {
                console.log("Este host esta agregado");
              } else {
                const host = new Hosts({
                  hostName: hostResult.hostname,
                  ipAddress: hostResult.ipAddress,
                  status: hostResult.status,
                  operatingSystem: hostResult.operatingSystem,
                  networkName: networkID,
                });

                host.save();

                const network = await Networks.findById({
                  _id: host.networkName,
                });

                network.hosts.push(host);
                network.save();
              }
            });
          }
        }
      );
    });
  };

  networkScan();
};

exports.getHosts = (req, res) => {


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
