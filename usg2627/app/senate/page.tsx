import GridShell from "../components/GridShell";
import ProfileCard from "../components/ProfileCard";

const senateMembers = [
  {
    name: "Win Gatchalian",
    role: "Senate President",
    avatarSrc: "/grad_ pic2.jpg",
    trunkLine: "(632) 552-6601",
    directLine: "(632) 552-6601 loc. 5301",
    roomAddress: "Room 502, Senate Building",
    authoredBills: 45,
    coAuthoredBills: 128,
    authoredResolutions: 32,
    coAuthoredResolutions: 67,
    billsPassedIntoLaw: 18,
  },
  {
    name: "Vicente C. Sotto III",
    role: "Senate President Pro Tempore",
    avatarSrc: "/grad_ pic2.jpg",
    trunkLine: "(632) 552-6601",
    directLine: "(632) 552-6601 loc. 5302",
    roomAddress: "Room 503, Senate Building",
    authoredBills: 38,
    coAuthoredBills: 95,
    authoredResolutions: 28,
    coAuthoredResolutions: 54,
    billsPassedIntoLaw: 15,
  },
  {
    name: "Maria Imelda Josefa",
    role: "Secretary General",
    avatarSrc: "/grad_ pic2.jpg",
    trunkLine: "(632) 552-6601",
    directLine: "(632) 552-6601 loc. 5303",
    roomAddress: "Room 504, Senate Building",
    authoredBills: 22,
    coAuthoredBills: 67,
    authoredResolutions: 19,
    coAuthoredResolutions: 41,
    billsPassedIntoLaw: 8,
  },
  {
    name: "Rafael P. Santos",
    role: "Chair, Rules & Ethics",
    avatarSrc: "/grad_ pic2.jpg",
    trunkLine: "(632) 552-6601",
    directLine: "(632) 552-6601 loc. 5304",
    roomAddress: "Room 505, Senate Building",
    authoredBills: 29,
    coAuthoredBills: 83,
    authoredResolutions: 24,
    coAuthoredResolutions: 48,
    billsPassedIntoLaw: 12,
  },
  {
    name: "Rafael P. Santos",
    role: "Chair, Rules & Ethics",
    avatarSrc: "/grad_ pic2.jpg",
    trunkLine: "(632) 552-6601",
    directLine: "(632) 552-6601 loc. 5304",
    roomAddress: "Room 505, Senate Building",
    authoredBills: 29,
    coAuthoredBills: 83,
    authoredResolutions: 24,
    coAuthoredResolutions: 48,
    billsPassedIntoLaw: 12,
  },
  {
    name: "Rafael P. Santos",
    role: "Chair, Rules & Ethics",
    avatarSrc: "/grad_ pic2.jpg",
    trunkLine: "(632) 552-6601",
    directLine: "(632) 552-6601 loc. 5304",
    roomAddress: "Room 505, Senate Building",
    authoredBills: 29,
    coAuthoredBills: 83,
    authoredResolutions: 24,
    coAuthoredResolutions: 48,
    billsPassedIntoLaw: 12,
  },
  {
    name: "Rafael P. Santos",
    role: "Chair, Rules & Ethics",
    avatarSrc: "/grad_ pic2.jpg",
    trunkLine: "(632) 552-6601",
    directLine: "(632) 552-6601 loc. 5304",
    roomAddress: "Room 505, Senate Building",
    authoredBills: 29,
    coAuthoredBills: 83,
    authoredResolutions: 24,
    coAuthoredResolutions: 48,
    billsPassedIntoLaw: 12,
  },
  {
    name: "Rafael P. Santos",
    role: "Chair, Rules & Ethics",
    avatarSrc: "/grad_ pic2.jpg",
    trunkLine: "(632) 552-6601",
    directLine: "(632) 552-6601 loc. 5304",
    roomAddress: "Room 505, Senate Building",
    authoredBills: 29,
    coAuthoredBills: 83,
    authoredResolutions: 24,
    coAuthoredResolutions: 48,
    billsPassedIntoLaw: 12,
  },
];

export default function SenatePage() {
  return (
    <GridShell>
      <main className="mx-auto max-w-6xl px-6 py-20">
        <h1 className="text-5xl font-black tracking-[-0.06em] text-slate-900">
          Senate Members
        </h1>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {senateMembers.map((member, index) => (
            <ProfileCard key={index} {...member} />
          ))}
        </div>
      </main>
    </GridShell>
  );
}
