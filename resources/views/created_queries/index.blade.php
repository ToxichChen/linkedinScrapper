@extends('layouts.app')
@section('content')

    <a class="btn btn-primary mb-5" href="/created_queries/create_form" > Create New </a>
    <table id="table_id" class="display">
        <thead>
        <tr>
            <th>ID</th>
            <th>Company</th>
            <th>Parsing Type</th>
            <th>Is Parsed</th>
            <th>Created</th>
            <th>Updated</th>
        </tr>
        </thead>
        <tbody>
        @foreach ($createdQueries as $createdQuery)
            <tr>
                <td>{{$createdQuery->id}}</td>
                <td>{{$createdQuery->company_name}}</td>
                <td>{{$createdQuery->type_of_parsing}}</td>
                <td>{{$createdQuery->is_parsed}}</td>
                <td>{{$createdQuery->created_at}}</td>
                <td>{{$createdQuery->updated_at}}</td>
            </tr>
        @endforeach
        </tbody>
    </table>

    <script>
        $(document).ready(function () {
            $('#table_id').DataTable();
        });
    </script>
@endsection
