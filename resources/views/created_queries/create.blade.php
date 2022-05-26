@extends('layouts.app')
@section('content')
    <form method="post" action="/created_queries/create">
        @csrf
        <div class="form-group">
            <label for="company">Select company</label>
            <select class="form-control" id="company" name="company">
                @foreach($companies as $company)
                <option value="{{$company->id}}">{{$company->company_name}}</option>
                @endforeach
            </select>
        </div>
        <div class="form-group">
            <label for="type">Select type of parsing</label>
            <select class="form-control" id="type" name="type">
                <option value="init">Initial parsing</option>
                <option value="update">Find new</option>
                <option value="past">Find past employees</option>
            </select>
        </div>
        <button type="submit" class="btn btn-primary">Submit</button>
    </form>
@endsection
