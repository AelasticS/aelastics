/*
 * Copyright (c) AelasticS 2019.
 */

import * as t from '../../src/aelastics-types'

export const AgeType = t.number.derive('Human age').int8.positive.inRange(1, 120)

export const StringOrNumberType = t.unionOf([t.string, t.number])

export const DoctorTypeProfession = t.literal('Doctor')
export const DoctorTypeSpecialization = t.string
  .derive('Specialization')
  .oneOf(['Surgeon', 'Cardiologist', 'Internist'])
export const DoctorType = t.object(
  {
    profession: DoctorTypeProfession,
    specialization: DoctorTypeSpecialization
  },
  'DoctorType'
)

export const LicenceType = t.string.derive('Driving licence').oneOf(['A', 'B', 'C', 'D', 'E'])

export const DriverTypeProfession = t.literal('Driver')
export const DriverTypeLicences = t.arrayOf(LicenceType)
export const DriverType = t.object(
  {
    profession: DriverTypeProfession,
    licences: DriverTypeLicences
  },
  'DriverType'
)

export const OccupationType = t.unionOf([DriverType, DoctorType])

export const SexType = t.unionOf([t.literal('male'), t.literal('female')], 'sex')

export const ChildType = t.object({ name: t.string }, 'Child')

export const BirthPlaceType = t.object({ name: t.string, state: t.string })

export const WorkerType = t.object(
  {
    name: t.string,
    age: t.optional(AgeType),
    sex: SexType,
    birthPlace: t.optional(BirthPlaceType),
    occupation: t.taggedUnion(
      {
        driver: DriverType,
        doctor: DoctorType
      },
      'profession'
    ),
    children: t.arrayOf(ChildType)
  },
  'WorkerType'
)

// subtype example
export const StudentType = t.subtype(ChildType, { university: t.string }, 'StudentType')

// multiple hierarchy subtype example
export const PartTimeStudentType = t.subtype(StudentType, { payFee: t.number }, 'PartTimeStudent')

// Map example
export const InvoiceType = t.object(
  {
    id: t.number,
    date: t.date,
    items: t.mapOf(
      t.number,
      t.object(
        {
          id: t.number,
          name: t.string
        },
        'ItemType'
      )
    )
  },
  'InvoiceType'
)

// Interface definitions
export type IWorkerType = t.TypeOf<typeof WorkerType>

// functional type example
export const firstChild = t.fun('firstChild', { worker: WorkerType }, ChildType)

// intersection type example
export const FullNameType = t.intersectionOf([
  t.object({ name: t.string.derive('').alphabetical }),
  t.object({ familyName: t.string })
])
export const ArtSchema = t.schema('ArtSchema')
export const SchemaSinger = t.schema('SchemaSinger', ArtSchema)
export const ComposerSchema = t.schema('ComposerSchema', SchemaSinger)
export const AlbumSchema = t.schema('AlbumSchema', ComposerSchema)
export const SongSchema = t.schema('SongSchema', AlbumSchema)

export const MovieSchema = t.schema('MovieSchema', ArtSchema)
export const AwardSchema = t.schema('AwardSchema', MovieSchema)
export const OlympicGamesSchema = t.schema('OlympicGamesSchema')
// genre type specialization
export const GenreSpecialization = t.string
  .derive('Specialization')
  .oneOf(['Jazz', 'Classic', 'Funk', 'Rock', 'Blues'])
// movie genre
export const MovieGenre = t.string
  .derive('Specialization')
  .oneOf(['Action', 'Comedy', 'Crime', 'Drama', 'Horror', 'Romance', 'Science fiction', 'Western'])
// movie type

// song duration
export const SongDuration = t.number.derive('Song duration').int8.inRange(2, 10)

// full song name
export const FullSongName = t.intersectionOf([
  t.object({ name: t.string }),
  t.object({ duration: SongDuration })
])
// Composer type
export const ComposerType = t.object(
  {
    name: FullNameType
  },
  'ComposerType',
  ComposerSchema
)
// Song type
export const SongType = t.object(
  {
    no: t.number,
    name: t.string,
    duration: SongDuration,
    composers: t.arrayOf(t.link(SchemaSinger, 'ComposerSchema/ComposerType')) // t.arrayOf(ComposerType)
  },
  'SongType',
  SongSchema
)
// Album type
export const AlbumType = t.object(
  {
    name: t.string,
    songs: t.arrayOf(t.link(SchemaSinger, 'ComposerSchema/AlbumSchema/SongSchema/SongType')), //  songs: t.arrayOf(SongType),
    lyricsOfSongs: t.optional(t.mapOf(t.number, t.string, 'Lyrics')),
    publishingHouse: t.object(
      {
        pib: t.number,
        name: t.string,
        established: t.number,
        contact: t.string
      },
      'PublishingHouseType',
      ComposerSchema
    )
  },
  'AlbumType',
  AlbumSchema
)

export const BandType = t.object(
  {
    name: t.string,
    members: t.arrayOf(t.link(SchemaSinger, 'SingerType'))
  },
  'BandType',
  SchemaSinger
)

// singer type
export const SingerType = t.object(
  {
    singerName: FullNameType,
    nickname: t.optional(t.string),
    albums: t.arrayOf(AlbumType),
    genre: GenreSpecialization,
    memberOfBand: t.optional(BandType)
  },
  'SingerType',
  SchemaSinger
)
// movie type

export const MovieType = t.object(
  {
    filmId: t.number.derive('Film id').greaterThan(0),
    name: t.string,
    genre: MovieGenre,
    director: t.link(ArtSchema, 'MovieSchema/DirectorType'),
    scenarist: t.link(ArtSchema, 'MovieSchema/ScenaristType'),
    actors: t.arrayOf(t.link(MovieSchema, 'ActorType')),
    musicInFilm: t.arrayOf(t.link(SchemaSinger, 'ComposerSchema/AlbumSchema/SongSchema/SongType'))
  },
  'MovieType',
  MovieSchema
)

// director type
export const DirectorType = t.object(
  {
    directorId: t.number,
    name: FullNameType,
    education: t.optional(t.string),
    awards: t.optional(t.mapOf(t.number, t.link(ArtSchema, 'MovieSchema/AwardSchema/AwardType'))) // key in the map is filmID
  },
  'DirectorType',
  MovieSchema
)

// scenarist type

export const ScenaristType = t.object(
  {
    scenaristId: t.number,
    name: FullNameType
  },
  'ScenaristType',
  MovieSchema
)

// actor type

export const ActorType = t.object(
  {
    actorId: t.number,
    name: FullNameType,
    // roles: t.mapOf(MovieType, t.string),
    awards: t.optional(t.mapOf(t.number, t.link(ArtSchema, 'MovieSchema/AwardSchema/AwardType'))) // key in the map is filmID
  },
  'ActorType',
  MovieSchema
)
// award type
export const AwardType = t.object(
  {
    name: t.string,
    year: t.number.positive,
    categoiries: t.arrayOf(t.string, 'Categories')
  },
  'AwardType',
  AwardSchema
)

// n-ary tree

export const OlympicGames = t.object(
  {
    year: t.number,
    countries: t.arrayOf(t.link(OlympicGamesSchema, 'CountryType'))
  },
  'OlympicGames',
  OlympicGamesSchema
)

export const CountryType = t.object(
  {
    name: t.string,
    sports: t.arrayOf(t.link(OlympicGamesSchema, 'SportType'))
  },
  'CountryType',
  OlympicGamesSchema
)

export const SportType = t.object(
  {
    name: t.string,
    disciplines: t.arrayOf(t.link(OlympicGamesSchema, 'DisciplineType'))
  },
  'SportType',
  OlympicGamesSchema
)

export const DisciplineType = t.object(
  {
    name: t.string,
    competitors: t.arrayOf(t.link(OlympicGamesSchema, 'CompetitorType'))
  },
  'DisciplineType',
  OlympicGamesSchema
)

export const CompetitorType = t.object(
  {
    name: t.string,
    yearsOfParticipation: t.arrayOf(t.number)
  },
  'CompetitoType',
  OlympicGamesSchema
)
